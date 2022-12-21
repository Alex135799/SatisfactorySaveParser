import { object_header_type } from './parse_object_header';
import { object_reference_type, parseObjectReferences } from './parse_object_references';
import { parseProperties } from './properties/parse_properties';
import { processRow } from './parse_save';

export interface actor_object_type {
    size?: number;
    parent_root_object?: string;
    parent_object_name?: string;
    component_count?: number;
    components?: object_reference_type[];
    properties?: any[];
    trailing_bytes?: string;
}
export interface component_object_type {
    size?: number;
    properties?: any[];
    trailing_bytes?: string;
}

export const object_actor_data: actor_object_type = {
    size: 1,
    parent_root_object: "",
    parent_object_name: "",
    component_count: 1,
    components: [],
    properties: [],
    trailing_bytes: "",
}

export const object_component_data: component_object_type = {
    size: 1,
    properties: [],
    //trailing_bytes: "",
}

export const parseObjects = (readStream: Buffer, offset: number, object_headers: object_header_type[]) => {
    let objectDataArr: actor_object_type[] | component_object_type[] = []
    let i = 0;
    object_headers.forEach(object_header => {
        i++
        let objectData: actor_object_type | component_object_type = {}

        let headerType = object_header.header_type
        
        if (headerType == 0) {
            let componentData: component_object_type = {}
            Object.entries(object_component_data).some(entry => {
                let key = entry[0]
                let value = entry[1]
                if (key == "properties") {
                    return true
                }
                else {
                    let processed = processRow(readStream, key, value, componentData, offset)
                    offset = processed.newOffset
                }
            });
            objectData = componentData
        }
        else if (headerType == 1) {
            let preActorOffset = offset;
            let actorData: actor_object_type = {}
            let component_count = 0
            Object.entries(object_actor_data).some(entry => {
                let key = entry[0]
                let value = entry[1]
                if (key == "properties") {
                    let properties = parseProperties(readStream, offset);
                    actorData.properties = properties.data;
                    offset = properties.newOffset;
                }
                else if (key == "components") {
                    let components = parseObjectReferences(readStream, offset, component_count)
                    if (actorData.components == undefined) {
                        actorData.components = []
                    }
                    let newCollectables = actorData.components.concat(components.data)
                    actorData.components = newCollectables;
                    offset = components.newOffset
                }
                else if (key == "component_count") {
                    let processed = processRow(readStream, key, value, actorData, offset)
                    component_count = processed.returnNumber
                    offset = processed.newOffset
                }
                else if (key == "trailing_bytes") {
                    if (offset < actorData.size! + preActorOffset) {
                        let newOffset = preActorOffset + actorData.size!
                        actorData.trailing_bytes = readStream.toString('hex', offset, newOffset)
                        offset = newOffset
                    } else if (offset > actorData.size! + preActorOffset) {
                        let errorDiff = offset - actorData.size! - preActorOffset
                        console.error("We are further than we should by: " + errorDiff)
                        throw new Error("We are further than we should by: " + errorDiff)
                    }
                    offset += 4
                }
                else {
                    let processed = processRow(readStream, key, value, actorData, offset)
                    offset = processed.newOffset
                }
            });
            objectData = actorData
        }
        //console.log("Actor Object added: " + objectData + " " + i + "/" +object_headers.length)
        objectDataArr.push(objectData)
    })
    //console.log("object additions closed..............")
    return {data: objectDataArr, newOffset: offset}
}