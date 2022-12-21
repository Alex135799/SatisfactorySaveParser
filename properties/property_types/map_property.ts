import { processRow, readByte, readFloat, readInt } from "../../parse_save";
import { parseProperties } from "../parse_properties";
import { non_typed_property_type, parseBasedOnType } from "../property_type_factory";
import { typed_property_type } from "../typed/typed_property_types";

export interface map_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    key_type?: string;
    value_type?: string;
    padding?: number;
    mode_type?: number;
    number_of_elements?: number;
    elements?: map_element_property_type[]
}
export interface map_element_property_type {
    key: typed_property_type;
    value: typed_property_type;
}
export const map_property_data: map_property_type = {
    size: 1,
    index: 1,
    key_type: "",
    value_type: "",
    padding: 0,
    mode_type: 1,
    number_of_elements: 1,
    //elements: [],

    parseProperty: function (readStream: Buffer, offset: number, map_property_type: string, parent_property_type: string) {
        let propertyData: map_property_type = {}
        Object.entries(this).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key != "parseProperty") {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
            }
        });
        
        console.log("MAPre: " + JSON.stringify(propertyData))

        let elementMap = new Map();
        for (let index = 0; index < propertyData.number_of_elements!; index++) {
            let parsedKey = parseBasedOnType(readStream, offset, propertyData.key_type!, map_property_type)
            offset = (parsedKey as {data: object, newOffset: number}).newOffset
            let key = (parsedKey as {data: object, newOffset: number}).data
            let value

            let readData
            switch (propertyData.value_type!) {
                case "ByteProperty":
                    readData = readByte(readStream, offset)
                    value = readData.number
                    offset = readData.newOffset
                    break;
                case "IntProperty":
                    readData = readInt(readStream, offset)
                    value = readData.number
                    offset = readData.newOffset
                    break;
                case "FloatProperty":
                    readData = readFloat(readStream, offset)
                    value = readData.number
                    offset = readData.newOffset
                    break;
                case "StructProperty":
                    let parsed = parseProperties(readStream, offset)
                    value = parsed.data
                    offset = parsed.newOffset
                    break;
                default:
                    throw new Error("Map Value type: " + propertyData.value_type! + " is not known.")
            }

            elementMap.set(key, value);
        }

        console.log("MAP: " + JSON.stringify(propertyData))

        return {data: propertyData, newOffset: offset}
    }
}
