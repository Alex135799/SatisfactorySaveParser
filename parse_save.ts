export const readInt = (readStream: Buffer, offset: number) => {
    let num = readStream.readInt32LE(offset);
    offset += 4;
    return {number: num, newOffset: offset};
}

export const readByte = (readStream: Buffer, offset: number) => {
    let num = readStream.readInt8(offset);
    offset += 1;
    return {number: num, newOffset: offset};
}

export const readLong = (readStream: Buffer, offset: number) => {
    let long = readStream.readBigInt64LE(offset)
    offset += 8;
    return {number: Number(long), newOffset: offset};
}

export const readFloat = (readStream: Buffer, offset: number) => {
    let arrayBuffer = readStream.buffer.slice(offset, offset + 4)
    let float = new DataView(arrayBuffer).getFloat32(0, true)
    offset += 4;
    return {number: float, newOffset: offset};
}

export const readString = (readStream: Buffer, offset: number) => {
    let intRead = readInt(readStream, offset)
    let stringLength = intRead.number
    if (stringLength > 10000) {
        console.error("20Bytes before: " + readStream.toString('hex', offset-40, offset))
        console.error("20Bytes after: " + readStream.toString('hex', offset, offset + 40))
        console.error("20Bytes after: " + readStream.toString('hex', offset + 40, offset + 80))
        console.error("String Len: " + stringLength)
        throw new Error("string too long: " + stringLength)
    }

    offset = intRead.newOffset

    let str = ""
    if(stringLength < 0) {
        str = readStream.toString('utf16le', offset, offset + stringLength/2 - 2)
    }
    else if(stringLength > 0) {
       str = readStream.toString('utf-8', offset, offset + stringLength - 1)
    }
    else if(stringLength == 0) {
        return {value: "", newOffset: offset}
    }
    
    offset += stringLength
    return { value: str, newOffset: offset }
}

export const processRow = (readStream: Buffer, key: string, value: any, addToObject: any, offset: number) => {
    let name = key;
    let type = value;
    let ret: number;
    if (typeof type === 'string') {
        let streamRead = readString(readStream, offset)
        let str = streamRead.value
        offset = streamRead.newOffset
        addToObject[name] = str
        ret = 0
    } else if (typeof type == 'number' && type == 1) {
        let streamRead = readInt(readStream, offset)
        ret = streamRead.number
        offset = streamRead.newOffset
        addToObject[name] = ret
    } else if (typeof type == 'number' && type == 2) {
        let streamRead = readLong(readStream, offset)
        ret = streamRead.number
        offset = streamRead.newOffset
        addToObject[name] = ret
    } else if (typeof type == 'number' && type == 0) {
        let streamRead = readByte(readStream, offset)
        ret = streamRead.number
        offset = streamRead.newOffset
        addToObject[name] = ret
    } else if (typeof type == 'number' && type == 3) {
        let streamRead = readFloat(readStream, offset)
        ret = streamRead.number
        offset = streamRead.newOffset
        addToObject[name] = ret
    } else {
        console.warn("isOther: -----" + name + "-----: " + value)
        ret = 0
    }
    return {returnNumber: ret, newOffset: offset};
}
