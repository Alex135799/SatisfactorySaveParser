import { object_reference_data } from "../parse_object_references";
import { array_property_data } from "./property_types/array_property";
import { bool_property_data } from "./property_types/bool_property";
import { byte_property_data } from "./property_types/byte_property";
import { enum_property_data } from "./property_types/enum_property";
import { float_property_data } from "./property_types/float_property";
import { int64_property_data } from "./property_types/int64_property";
import { int_property_data } from "./property_types/int_property";
import { map_property_data } from "./property_types/map_property";
import { name_property_data } from "./property_types/name_property";
import { object_property_data } from "./property_types/object_property";
import { set_property_data } from "./property_types/set_property";
import { struct_property_data } from "./property_types/struct_property";
import { str_property_data } from "./property_types/str_property";
import { text_property_data } from "./property_types/text_property";
import { typed_box_data, typed_fluid_box_data, typed_inventory_item_data, typed_linear_color_data, typed_quat_data, typed_railroad_track_position_data, typed_vector_data } from "./typed/typed_property_types";

export interface property_type {
    parseProperty?(readStream: Buffer, offset: number, property_type: string, parent_property_type?: string): 
        {newOffset: number; data: object}
}
export interface non_typed_property_type extends property_type {};

export const parseBasedOnType = (readStream: Buffer, offset: number, type: string, parentType?: string) => {
    console.log(parentType + " -> " + type)
    switch (type) {
        case "ArrayProperty":
            return array_property_data.parseProperty!(readStream, offset, type, parentType);
        case "BoolProperty":
            return bool_property_data.parseProperty!(readStream, offset, type, parentType);
        case "ByteProperty":
            if (parentType == "ArrayProperty" || parentType == "MapProperty")
                return 0;
            else
                return byte_property_data.parseProperty!(readStream, offset, type, parentType);
        case "EnumProperty":
            if (parentType == "ArrayProperty")
                return "";
            else
                return enum_property_data.parseProperty!(readStream, offset, type, parentType);
        case "FloatProperty":
            return float_property_data.parseProperty!(readStream, offset, type, parentType);
        case "IntProperty":
            if (parentType == "ArrayProperty" || parentType == "MapProperty")
                return 1;
            else
                return int_property_data.parseProperty!(readStream, offset, type, parentType);
        case "Int64Property":
            return int64_property_data.parseProperty!(readStream, offset, type, parentType);
        case "MapProperty":
            return map_property_data.parseProperty!(readStream, offset, type, parentType);
        case "NameProperty":
            return name_property_data.parseProperty!(readStream, offset, type, parentType);
        case "InterfaceProperty":
        case "ObjectProperty":
            if (parentType == "ArrayProperty" || parentType == "MapProperty")
                return object_reference_data.parseProperty!(readStream, offset, type, parentType);
            else
                return object_property_data.parseProperty!(readStream, offset, type, parentType);
        case "SetProperty":
            return set_property_data.parseProperty!(readStream, offset, type, parentType);
        case "StrProperty":
            return str_property_data.parseProperty!(readStream, offset, type, parentType);
        case "StructProperty":
            return struct_property_data.parseProperty!(readStream, offset, type, parentType);
        case "TextProperty":
            return text_property_data.parseProperty!(readStream, offset, type, parentType);

        case "Box":
            return typed_box_data.parseProperty!(readStream, offset, type, parentType);
        case "FluidBox":
            return typed_fluid_box_data.parseProperty!(readStream, offset, type, parentType);
        case "InventoryStack":
        case "InventoryItem":
            return typed_inventory_item_data.parseProperty!(readStream, offset, type, parentType);
        case "LinearColor":
            return typed_linear_color_data.parseProperty!(readStream, offset, type, parentType);
        case "Quat":
            return typed_quat_data.parseProperty!(readStream, offset, type, parentType);
        case "RailroadTrackPosition":
            return typed_railroad_track_position_data.parseProperty!(readStream, offset, type, parentType);
        case "Vector":
            return typed_vector_data.parseProperty!(readStream, offset, type, parentType);
        default:
            if (parentType == "ArrayProperty") {
                console.warn("type fell through factory: " + type);
                return false
            } else {
                console.error("type fell through factory: " + type);
                throw new Error("Cannot find Type: " + type);
            }
    }
}