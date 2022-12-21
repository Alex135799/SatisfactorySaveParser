import { processRow } from "../../parse_save";
import { non_typed_property_type } from "../property_type_factory";

export interface byte_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    type?: string;
    padding?: number;
    value?: number | string;
}
export const byte_property_data: byte_property_type = {
    size: 1,
    index: 1,
    type: "",
    padding: 0,
    value: 0,

    parseProperty: function (readStream: Buffer, offset: number, byte_property_type: string, parent_property_type: string) {
        let propertyData: byte_property_type = {}
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
