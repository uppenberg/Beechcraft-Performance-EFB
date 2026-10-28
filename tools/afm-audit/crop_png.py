import struct, zlib, sys
src, out, left, top, width, height = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:])
data = open(src, 'rb').read()
pos = 8
chunks = []
while pos < len(data):
    n = struct.unpack('>I', data[pos:pos+4])[0]
    kind = data[pos+4:pos+8]
    body = data[pos+8:pos+8+n]
    pos += 12+n
    if kind == b'IHDR':
        w,h,depth,color,comp,filt,interlace = struct.unpack('>IIBBBBB', body)
    elif kind == b'IDAT': chunks.append(body)
    elif kind == b'IEND': break
if depth != 8 or color != 0 or interlace != 0:
    raise SystemExit(f'Unsupported PNG format depth={depth} color={color} interlace={interlace}')
raw = zlib.decompress(b''.join(chunks))
stride = w
rows = []
prior = bytearray(stride)
off = 0
for y in range(h):
    f = raw[off]; off += 1
    row = bytearray(raw[off:off+stride]); off += stride
    for x in range(stride):
        a = row[x-1] if x else 0
        b = prior[x]
        c = prior[x-1] if x else 0
        if f == 1: row[x] = (row[x]+a)&255
        elif f == 2: row[x] = (row[x]+b)&255
        elif f == 3: row[x] = (row[x]+((a+b)//2))&255
        elif f == 4:
            p = a+b-c; pa=abs(p-a); pb=abs(p-b); pc=abs(p-c)
            row[x] = (row[x]+(a if pa<=pb and pa<=pc else b if pb<=pc else c))&255
        elif f != 0: raise SystemExit(f'Unknown PNG filter {f}')
    rows.append(row); prior=row
right=min(w,left+width); bottom=min(h,top+height)
if left < 0 or top < 0 or right <= left or bottom <= top: raise SystemExit('Invalid crop')
cw,ch=right-left,bottom-top
out_raw=b''.join(b'\0'+bytes(row[left:right]) for row in rows[top:bottom])
def chunk(t,b): return struct.pack('>I',len(b))+t+b+struct.pack('>I',zlib.crc32(t+b)&0xffffffff)
with open(out,'wb') as f:
    f.write(b'\x89PNG\r\n\x1a\n')
    f.write(chunk(b'IHDR',struct.pack('>IIBBBBB',cw,ch,8,0,0,0,0)))
    f.write(chunk(b'IDAT',zlib.compress(out_raw,6)))
    f.write(chunk(b'IEND',b''))
print(f'{src}: {w}x{h} -> {out}: {cw}x{ch}')
