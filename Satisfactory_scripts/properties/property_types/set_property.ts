import { non_typed_property_type } from "../property_type_factory";
import { typed_property_type } from "../typed/typed_property_types";

export interface set_property_type extends non_typed_property_type {
    size?: number;
    index?: number;
    type?: string;
    padding?: number;
    padding2?: number;
    length?: number;
    elements?: typed_property_type[];
}
export const set_property_data: set_property_type = {
    size: 1,
    index: 1,
    type: "",
    padding: 0,
    padding2: 1,
    length: 1,
    elements: [],
}
