import { processRow } from "../../parse_save";
import { parseProperties } from "../parse_properties";
import { non_typed_property_type, parseBasedOnType } from "../property_type_factory";
import { typed_property_type } from "../typed/typed_property_types";

export interface array_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    type?: string;
    padding?: number;
    number_of_elements?: number;
    elements?: any[];
}
export const array_property_data: array_property_type = {
    size: 1,
    index: 1,
    type: "",
    padding: 0,
    number_of_elements: 1,
    //elements: [],

    parseProperty: function (readStream: Buffer, offset: number, array_property_type: string, parent_property_type: string) {
        let propertyData: array_property_type = {}
        Object.entries(this).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key != "parseProperty") {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
            }
        });
        propertyData.elements = []

        console.log("ARRPRE: " + JSON.stringify(propertyData))
        let structPropertyData: array_struct_property_type = {};
        if (propertyData.type == "StructProperty") {
            Object.entries(array_struct_property_data_common).some(entry => {
                let key = entry[0]
                let value = entry[1]
                let processed = processRow(readStream, key, value, structPropertyData, offset)
                offset = processed.newOffset
            });
            if (structPropertyData.type == "StructProperty") {
                Object.entries(array_struct_property_data_only_struct).some(entry => {
                    let key = entry[0]
                    let value = entry[1]
                    let processed = processRow(readStream, key, value, structPropertyData, offset)
                    offset = processed.newOffset
                });
                Object.entries(array_struct_property_data_struct_and_object).some(entry => {
                    let key = entry[0]
                    let value = entry[1]
                    let processed = processRow(readStream, key, value, structPropertyData, offset)
                    offset = processed.newOffset
                });
            }
            else if (structPropertyData.type == "ObjectProperty") {
                Object.entries(array_struct_property_data_struct_and_object).some(entry => {
                    let key = entry[0]
                    let value = entry[1]
                    let processed = processRow(readStream, key, value, structPropertyData, offset)
                    offset = processed.newOffset
                });
            }
            else {
                Object.entries(array_struct_property_data_other).some(entry => {
                    let key = entry[0]
                    let value = entry[1]
                    let processed = processRow(readStream, key, value, structPropertyData, offset)
                    offset = processed.newOffset
                });
            }
        }

        structPropertyData.data = []
        for (let index = 0; index < propertyData.number_of_elements!; index++) {
            if (propertyData.size == 3925) {
                console.log("Index: " + index)
                console.log("ARRPRENEFE: " + JSON.stringify(structPropertyData))
                console.log("ARRPRENE: " + JSON.stringify(propertyData))
            }
            if (propertyData.type == "StructProperty") {
                let parsed = parseBasedOnType(readStream, offset, structPropertyData.element_type!, array_property_type)

                if (parsed == false) {
                    let parsed = parseProperties(readStream, offset)
                    structPropertyData.data.push(parsed.data)
                    offset = parsed.newOffset
                }
                else {
                    structPropertyData.data.push((parsed as {data: object, newOffset: number}).data)
                    offset = (parsed as {data: object, newOffset: number}).newOffset
                }

                propertyData.elements.push(structPropertyData)
            }
            else {
                let parsed = parseBasedOnType(readStream, offset, propertyData.type!, array_property_type)
                propertyData.elements.push((parsed as {data: object, newOffset: number}).data)
                offset = (parsed as {data: object, newOffset: number}).newOffset
            }
        }

        return {data: propertyData, newOffset: offset}
    }
}

export interface array_struct_property_type extends non_typed_property_type {
    name?: string;
    type?: string;
    size?: number;
    padding?: number;
    element_type?: string;
    uuid1?: number;
    uuid2?: number;
    uuid3?: number;
    uuid4?: number;
    padding2?: number;
    data?: any;
}
export const array_struct_property_data_common: array_struct_property_type = {
    name: "",
    type: "",
    /*
    size: 1,
    padding: 1,
    element_type: "",
    uuid1: 1,
    uuid2: 1,
    uuid3: 1,
    uuid4: 1,
    padding2: 0,
    */
    //data: {},
}
export const array_struct_property_data_only_struct: array_struct_property_type = {
    /*
    name: "",
    type: "",
    */
    size: 1,
    padding: 1,
    element_type: ""
    /*,
    uuid1: 1,
    uuid2: 1,
    uuid3: 1,
    uuid4: 1,
    padding2: 0,
    */
    //data: {},
}
export const array_struct_property_data_struct_and_object: array_struct_property_type = {
    /*
    name: "",
    type: "",
    size: 1,
    padding: 1,
    element_type: "",
    */
    uuid1: 1,
    uuid2: 1,
    uuid3: 1,
    uuid4: 1,
    padding2: 0,
    //data: {},
}
export const array_struct_property_data_other: array_struct_property_type = {
    /*
    name: "",
    type: "",
    size: 1,
    padding: 1,
    element_type: "",
    */
    uuid1: 1,
    uuid2: 1,
    uuid3: 1,
    //uuid4: 1,
    padding2: 0,
    //data: {},
}