import * as fs from 'fs';
import { processCompressedData, compressed_chunk_type as save_file_body } from './parse_compressed_chunks';
import { processRow } from './parse_save';

interface final_data_type {
    save_header_version?: number;
    save_version?: number;
    build_version?: number;
    map_name?: string;
    map_options?: string;
    session_name?: string;
    seconds_played?: number;
    ticks_played?: number;
    session_visability?: number;
    editor_object_version?: number;
    mod_metadata?: string;
    mod_flags?: number;
    save_id?: string;
    compressed_metadata?: compressed_body_metadata_type[];
    actual_data?: save_file_body;
}
interface compressed_body_metadata_type {
    unreal_pkg_sig?: number;
    padding?: number;
    max_chunk_size?: number;
    padding2?: number;
    compressed_size?: number;
    padding3?: number;
    uncompressed_size?: number;
    padding4?: number;
    compressed_size2?: number;
    padding5?: number;
    uncompressed_size2?: number;
    padding6?: number;
}

const empty_final_data: final_data_type = {
    save_header_version: 1,
    save_version: 1,
    build_version: 1,
    map_name: "",
    map_options: "",
    session_name: "",
    seconds_played: 1,
    ticks_played: 2,
    session_visability: 0,
    editor_object_version: 1,
    mod_metadata: "",
    mod_flags: 1,
    save_id: "",
}
const compressed_body_metadata: compressed_body_metadata_type = {
    unreal_pkg_sig: 1,
    padding: 1,
    max_chunk_size: 1,
    padding2: 1,
    compressed_size: 1,
    padding3: 1,
    uncompressed_size: 1,
    padding4: 1,
    compressed_size2: 1,
    padding5: 1,
    uncompressed_size2: 1,
    padding6: 1,
}

let offset = 0
let finalData: final_data_type = {};
let compressedMetadataArr: compressed_body_metadata_type[] = [];
let readFile = fs.readFileSync('save_file.sav')

Object.entries(empty_final_data).some(entry => {
    let key = entry[0]
    let value = entry[1]
    let processed = processRow(readFile, key, value, finalData, offset)
    offset = processed.newOffset
});

let compressedData: compressed_body_metadata_type = {}
let compressed_size = 0
let start_markers: number[] = []
let end_markers: number[] = []
while (offset < readFile.length) {
    Object.entries(compressed_body_metadata).some(entry => {
        let key = entry[0]
        let value = entry[1]
        if (key == "compressed_size") {
            let processed = processRow(readFile, key, value, compressedData, offset)
            compressed_size = processed.returnNumber
            offset = processed.newOffset
        }
        else {
            let processed = processRow(readFile, key, value, compressedData, offset)
            offset = processed.newOffset
        }
    });
    start_markers.push(offset)
    end_markers.push(offset + compressed_size)
    offset = offset + compressed_size
    compressedMetadataArr.push(compressedData)
}

let actual_data = processCompressedData(readFile, start_markers, end_markers);

finalData.actual_data = actual_data
finalData.compressed_metadata = compressedMetadataArr
fs.writeFileSync("finalData.json", JSON.stringify(finalData))
console.log("Chunks: " + finalData.compressed_metadata.length)
console.log("Processed Size: " + finalData.compressed_metadata.length)
