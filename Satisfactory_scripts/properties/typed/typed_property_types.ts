import { processRow } from "../../parse_save";
import { parseProperties } from "../parse_properties";
import { int_property_type } from "../property_types/int_property";
import { parseBasedOnType, property_type } from "../property_type_factory";

export interface typed_property_type extends property_type {}

export interface typed_box_type extends typed_property_type {
    min_x?: number;
    min_y?: number;
    min_z?: number;
    max_x?: number;
    max_y?: number;
    max_z?: number;
    is_valid?: number;
}
export const typed_box_data: typed_box_type = {
    min_x: 3,
    min_y: 3,
    min_z: 3,
    max_x: 3,
    max_y: 3,
    max_z: 3,
    is_valid: 0,
}

export interface typed_fluid_box_type extends typed_property_type {
    value?: number;
}
export const typed_fluid_box_data: typed_fluid_box_type = {
    value: 3,
}

export interface typed_inventory_item_type extends typed_property_type {
    padding?: number;
    type?: string;
    level_name?: string;
    path_name?: string;
    extra_property?: int_property_type;
}
export const stack_typed_inventory_item_data: typed_inventory_item_type = {
    level_name: "",
    type: "",
    extra_property: {},
}
export const typed_inventory_item_data: typed_inventory_item_type = {
    padding: 1,
    type: "",
    level_name: "",
    path_name: "",

    parseProperty: function (readStream: Buffer, offset: number, inventory_property_type: string, parent_property_type: string) {
        let propertyData: typed_inventory_item_type = {}
        
        let extra_type = ""
        let objectToUse: typed_inventory_item_type
        if (inventory_property_type === "InventoryStack")
            objectToUse = stack_typed_inventory_item_data;
        else
            objectToUse = this;
            
        Object.entries(objectToUse).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key == "parseProperty") {
                return;
            }
            else if (key == "extra_property") {
                console.log("INV: " + JSON.stringify(propertyData))
                let parsed = parseBasedOnType(readStream, offset, extra_type, inventory_property_type)
                offset = (parsed as {newOffset: number; data: object}).newOffset;
                propertyData.extra_property = (parsed as {newOffset: number; data: object}).data
            }
            else if (key == "type") {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
                extra_type = propertyData.type!
            }
            else {
                let processed = processRow(readStream, key, value, propertyData, offset)
                offset = processed.newOffset
            }
        });

        return {data: propertyData, newOffset: offset}
    }
}

export interface typed_linear_color_type extends typed_property_type {
    r?: number;
    g?: number;
    b?: number;
    a?: number;
}
export const typed_linear_color_data: typed_linear_color_type = {
    r: 3,
    g: 3,
    b: 3,
    a: 3,

    parseProperty: function (readStream: Buffer, offset: number, color_property_type: string, parent_property_type: string) {
        let propertyData: typed_linear_color_type = {}
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

export interface typed_quat_type extends typed_property_type {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
}
export const typed_quat_data: typed_quat_type = {
    x: 3,
    y: 3,
    z: 3,
    w: 3,
}

export interface typed_railroad_track_position_type extends typed_property_type {
    level_name?: string;
    path_name?: string;
    offset?: number;
    forward?: number;
}
export const typed_railroad_track_position_data: typed_railroad_track_position_type = {
    level_name: "",
    path_name: "",
    offset: 3,
    forward: 3,
}

export interface typed_vector_type extends typed_property_type {
    x?: number;
    y?: number;
    z?: number;
}
export const typed_vector_data: typed_vector_type = {
    x: 3,
    y: 3,
    z: 3,

    parseProperty: function (readStream: Buffer, offset: number, vector_property_type: string, parent_property_type: string) {
        let propertyData: typed_vector_type = {}
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