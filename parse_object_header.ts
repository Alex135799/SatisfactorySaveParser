import { processRow } from './parse_save';

export interface object_header_type {
    header_type?: number;
    object_header?: actor_header_type | component_header_type;
}
export interface actor_header_type {
    type_path?: string;
    root_object?: string;
    instance_name?: string;
    need_transform?: number;
    rot_x?: number;
    rot_y?: number;
    rot_z?: number;
    rot_w?: number;
    pos_x?: number;
    pos_y?: number;
    pos_z?: number;
    scale_x?: number;
    scale_y?: number;
    scale_z?: number;
    was_placed?: number;
}
export interface component_header_type {
    type_path?: string;
    root_object?: string;
    instance_name?: string;
    parent_actor_name?: string;
}

export const object_header_data: object_header_type = {
    header_type: 1,
}

export const object_header_actor_data: actor_header_type = {
    type_path: "",
    root_object: "",
    instance_name: "",
    need_transform: 1,
    rot_x: 3,
    rot_y: 3,
    rot_z: 3,
    rot_w: 3,
    pos_x: 3,
    pos_y: 3,
    pos_z: 3,
    scale_x: 3,
    scale_y: 3,
    scale_z: 3,
    was_placed: 1,
}

export const object_header_component_data: component_header_type = {
    type_path: "",
    root_object: "",
    instance_name: "",
    parent_actor_name: "",
}

export const parseObjectHeaders = (readStream: Buffer, offset: number, object_header_count: number) => {
    let headerDataArr: object_header_type[] = []
    for (let object_header_count_index = 0; object_header_count_index < object_header_count; object_header_count_index++) {
        let headerData: object_header_type = {}

        let processed = processRow(readStream, "header_type", 1, headerData, offset)
        offset = processed.newOffset

        let headerType = headerData.header_type
        
        if (headerType == 0) {
            let componentData: component_header_type = {}
            Object.entries(object_header_component_data).some(entry => {
                let key = entry[0]
                let value = entry[1]
                let processed = processRow(readStream, key, value, componentData, offset)
                offset = processed.newOffset
            });
            headerData.object_header = componentData
        }
        else if (headerType == 1) {
            let actorData: actor_header_type = {}
            Object.entries(object_header_actor_data).some(entry => {
                let key = entry[0]
                let value = entry[1]
                let processed = processRow(readStream, key, value, actorData, offset)
                offset = processed.newOffset
            });
            headerData.object_header = actorData
        }
        headerDataArr.push(headerData)
    }
    return {data: headerDataArr, newOffset: offset}
}