import { processRow } from "../../parse_save";
import { non_typed_property_type } from "../property_type_factory";

export interface bool_property_type extends non_typed_property_type {
    padding?: number;
    index?: number;
    value?: number;
    padding2?: number;
}
export const bool_property_data: bool_property_type = {
    padding: 1,
    index: 1,
    value: 0,
    padding2: 0,

    parseProperty: function (readStream: Buffer, offset: number, bool_property_type: string, parent_property_type: string) {
        let propertyData: bool_property_type = {}
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