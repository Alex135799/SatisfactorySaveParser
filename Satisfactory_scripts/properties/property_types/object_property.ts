import { processRow } from "../../parse_save";
import { non_typed_property_type } from "../property_type_factory";

export interface object_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    padding?: number;
    level_name?: string;
    path_name?: string;
}
export const object_property_data: object_property_type = {
    size: 1,
    index: 1,
    padding: 0,
    level_name: "",
    path_name: "",

    parseProperty: function (readStream: Buffer, offset: number, object_property_type: string, parent_property_type: string) {
        let propertyData: object_property_type = {}
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
