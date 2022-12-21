import { processRow } from "../../parse_save";
import { non_typed_property_type, parseBasedOnType } from "../property_type_factory";
import { typed_property_type } from "../typed/typed_property_types";

export interface struct_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    type?: string;
    padding?: number;
    padding2?: number;
    padding3?: number;
    typed_data?: typed_property_type;
}
export const struct_property_data: struct_property_type = {
    size: 1,
    index: 1,
    type: "",
    padding: 2,
    padding2: 2,
    padding3: 0,
    typed_data: {},

    parseProperty: function (readStream: Buffer, offset: number, struct_property_type: string, parent_property_type: string) {
        let propertyData: struct_property_type = {}
        let property_type = ""
        Object.entries(this).some(entry => {
            let key = entry[0]
            let value = entry[1]
            
            if (key == "parseProperty") 
                return;
            else if (key == "typed_data") {
                let parsed = parseBasedOnType(readStream, offset, property_type, struct_property_type)
                offset = (parsed as {newOffset: number; data: object}).newOffset;
                propertyData.typed_data = (parsed as {newOffset: number; data: object}).data
            }
            else if (key == "type") {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
                property_type = propertyData.type!
            }
            else {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
            }
        });

        return {data: propertyData, newOffset: offset}
    }
}