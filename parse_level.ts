import { processRow } from './parse_save';
import { object_header_type, parseObjectHeaders } from './parse_object_header'
import { object_reference_type, parseObjectReferences } from './parse_object_references'
import { parseObjects } from './parse_objects'

export interface level_type {
    sublevel_name?: string;
    object_header_and_collectables_size?: number;
    object_header_count?: number;
    object_headers?: object_header_type[];
    collectables_count?: number;
    collectables?: object_reference_type[];
    objects_size?: number;
    object_count?: number;
    objects?: any[];
    second_collectables_count?: number;
    second_collectables?: any[];
}

export const level_data: level_type = {
    sublevel_name: "",
    object_header_and_collectables_size: 1,
    object_header_count: 1,
    object_headers: [],
    collectables_count: 1,
    collectables: [],
    objects_size: 1,
    object_count: 1,
    objects: [],
    second_collectables_count: 1,
    second_collectables: [],
}

export const processLevels = (readStream: Buffer, offset: number, sublevel_count: number) => {
    let levelDataArr: level_type[] = []
    let object_header_count = 0
    let collectables_count = 0
    let objects_count = 0
    let second_collectables_count = 0

    for (let index = 0; index < sublevel_count; index++) {
        console.log("level: " + " " + index + "/" + sublevel_count)
        let levelData: level_type = {}
        Object.entries(level_data).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key == "object_headers") {
                let object_headers = parseObjectHeaders(readStream, offset, object_header_count)
                if (levelData.object_headers == undefined) {
                    levelData.object_headers = []
                }
                let newHeaders = levelData.object_headers.concat(object_headers.data)
                levelData.object_headers = newHeaders;
                offset = object_headers.newOffset
            }
            else if (key == "object_header_count") {
                let processed = processRow(readStream, key, value, levelData, offset)
                object_header_count = processed.returnNumber
                offset = processed.newOffset
            }
            else if (key == "collectables") {
                let collectables = parseObjectReferences(readStream, offset, collectables_count)
                if (levelData.collectables == undefined) {
                    levelData.collectables = []
                }
                let newCollectables = levelData.collectables.concat(collectables.data)
                levelData.collectables = newCollectables;
                offset = collectables.newOffset
            }
            else if (key == "collectables_count") {
                let processed = processRow(readStream, key, value, levelData, offset)
                collectables_count = processed.returnNumber
                offset = processed.newOffset
            }
            else if (key == "second_collectables") {
                let second_collectables = parseObjectReferences(readStream, offset, second_collectables_count)
                if (levelData.second_collectables == undefined) {
                    levelData.second_collectables = []
                }
                let newCollectables = levelData.second_collectables.concat(second_collectables.data)
                levelData.second_collectables = newCollectables;
                offset = second_collectables.newOffset 
            }
            else if (key == "second_collectables_count") {
                let processed = processRow(readStream, key, value, levelData, offset)
                second_collectables_count = processed.returnNumber
                offset = processed.newOffset
            }
            else if (key == "objects") {
                let objects = parseObjects(readStream, offset, levelData.object_headers!)
                if (levelData.objects == undefined) {
                    levelData.objects = []
                }
                let newObjects = levelData.objects.concat(objects.data)
                levelData.objects = newObjects;
                offset = objects.newOffset
            }
            else if (key == "objects_count") {
                let processed = processRow(readStream, key, value, levelData, offset)
                objects_count = processed.returnNumber
                offset = processed.newOffset
                if (objects_count != object_header_count) {
                    console.error("THE FUCK??")
                }
            }
            else if (key == "sublevel_name") {
                if (index < sublevel_count - 1) {
                    let processed = processRow(readStream, key, value, levelData, offset)
                    offset = processed.newOffset
                }
                else {
                    levelData.sublevel_name = "Level PersistentLevel"
                }
            }
            else {
                let processed = processRow(readStream, key, value, levelData, offset)
                offset = processed.newOffset
            }
        });
        console.log("level: " + levelData + " " + index + "/" + sublevel_count)
        levelDataArr.push(levelData)
    }
    return {data: levelDataArr, newOffset: offset}
}