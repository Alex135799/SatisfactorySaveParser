import * as zlib from 'zlib';
import { processRow } from './parse_save';
import { level_type, processLevels } from './parse_level';
import { parseObjectReferences } from './parse_object_references'

export interface compressed_chunk_type {
    uncompressed_size?: number;
    sublevel_count?: number;
    levels?: level_type[],
    object_references_count?: number;
    object_references?: any[],
}

export const compressed_chunks_data: compressed_chunk_type = {
    uncompressed_size: 1,
    sublevel_count: 1,
    levels: [],
    object_references_count: 1,
    object_references: [],
}

export const processCompressedData = (readStream: Buffer, compressed_start_checkpoints: number[], compressed_end_checkpoints: number[]) => {
    let decompressedAllChunksArr: Buffer[] = []

    for (let index = 0; index < compressed_start_checkpoints.length; index++) {
        const start_checkpoint = compressed_start_checkpoints[index];
        const end_checkpoint = compressed_end_checkpoints[index];
        let compressedData = readStream.subarray(start_checkpoint, end_checkpoint)
        let decompressedDataChunk = zlib.unzipSync(compressedData);
        decompressedAllChunksArr.push(decompressedDataChunk)
    }
    
    let decompressedAllChunks: Buffer = Buffer.concat(decompressedAllChunksArr)
    let offset = 0
    let compressedFinalData : compressed_chunk_type = {}
    let sublevel_count = 0
    let object_references_count = 0

    Object.entries(compressed_chunks_data).some(entry => {
        let key = entry[0]
        let value = entry[1]
        if (key == "uncompressed_size") {
            let processed = processRow(decompressedAllChunks, key, value, compressedFinalData, offset)
            offset = processed.newOffset
            if (compressedFinalData.uncompressed_size != decompressedAllChunks.length - 4)
                throw new Error("Expected size: " + compressedFinalData.uncompressed_size + " Not equal to actual size: " + decompressedAllChunks.length)
            console.info("Size to process: " + compressedFinalData.uncompressed_size + " = " + decompressedAllChunks.length)
        }
        else if (key == "levels") {
            let processed = processLevels(decompressedAllChunks, offset, sublevel_count + 1)
            compressedFinalData.levels = processed.data
            offset = processed.newOffset
        }
        else if (key == "sublevel_count") {
            let processed = processRow(decompressedAllChunks, key, value, compressedFinalData, offset)
            sublevel_count = processed.returnNumber
            offset = processed.newOffset
        }
        else if (key == "object_references") {
            let processed = parseObjectReferences(decompressedAllChunks, offset, object_references_count)
            compressedFinalData.object_references = processed.data
            offset = processed.newOffset
        }
        else if (key == "object_references_count") {
            let processed = processRow(decompressedAllChunks, key, value, compressedFinalData, offset)
            object_references_count = processed.returnNumber
            offset = processed.newOffset
        }
        else {
            let processed = processRow(decompressedAllChunks, key, value, compressedFinalData, offset)
            offset = processed.newOffset
        }
    });
    return compressedFinalData
}