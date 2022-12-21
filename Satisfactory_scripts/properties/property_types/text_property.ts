import { processRow } from "../../parse_save";
import { non_typed_property_type } from "../property_type_factory";

export interface text_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    padding?: number;
    flags?: number;
    history_type?: number;
    is_text_culture_invariant?: number;
    text?: "";
}
export const text_property_data: text_property_type = {
    size: 1,
    index: 1,
    padding: 0,
    flags: 1,
    history_type: 0,
    is_text_culture_invariant: 1,
    text: "",

    parseProperty: function (readStream: Buffer, offset: number, text_property_type: string, parent_property_type: string) {
        let propertyData: text_property_type = {}
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
