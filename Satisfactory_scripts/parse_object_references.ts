import { processRow } from './parse_save';
import { property_type } from './properties/property_type_factory';

export interface object_reference_type extends property_type {
    level_name?: string;
    path_name?: string;
}

export const object_reference_data: object_reference_type = {
    level_name: "",
    path_name: "",

    parseProperty: function (readStream: Buffer, offset: number, obj_ref_property_type: string, parent_property_type: string) {
        let propertyData: object_reference_type = {}
        Object.entries(this).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key != "parseProperty") {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
            }
        });

        return {data: propertyData, newOffset: offset}
    }
}

export const parseObjectReferences = (readStream: Buffer, offset: number, object_reference_count: number) => {
    let objectReferenceArr: object_reference_type[] = []
    for (let object_reference_count_index = 0; object_reference_count_index < object_reference_count; object_reference_count_index++) {
        let objectReference: object_reference_type = {}
        Object.entries(object_reference_data).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key != "parseProperty") {
                let processed = processRow(readStream, key, value, objectReference, offset)
                offset = processed.newOffset
            }
        });
        objectReferenceArr.push(objectReference)
    }
    return {data: objectReferenceArr, newOffset: offset}
}