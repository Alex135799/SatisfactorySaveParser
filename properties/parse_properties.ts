import { processRow } from '../parse_save';
import { parseBasedOnType, non_typed_property_type } from './property_type_factory';

export interface properties_type {
    name?: string;
    type?: string;
    property?: non_typed_property_type;
}

export const properties_data: properties_type = {
    name: "",
    type: "",
    property: {},
}

export const parseProperties = (readStream: Buffer, offset: number) => {
    let propertiesDataArr: properties_type[] = []
    let gettingProperties = true;
    do {
        let propertiesData: properties_type = {}
        let property_type: string = ""
        Object.entries(properties_data).some(entry => {
            let key = entry[0]
            let value = entry[1]
            if (key == "property") {
                let parsed = parseBasedOnType(readStream, offset, property_type, undefined);
                offset = (parsed as {newOffset: number; data: object}).newOffset
                propertiesData.property = (parsed as {newOffset: number; data: object}).data
            }
            else if (key == "type") {
                let processed = processRow(readStream, key, value, propertiesData, offset)
                offset = processed.newOffset
                property_type = propertiesData.type!
            }
            else if (key == "name") {
                let processed = processRow(readStream, key, value, propertiesData, offset)
                offset = processed.newOffset
                if (propertiesData.name === "None") {
                    gettingProperties = false;
                    return true;
                }
            }
            else {
                let processed = processRow(readStream, key, value, propertiesData, offset)
                offset = processed.newOffset
            }
        });
        if (gettingProperties)
            propertiesDataArr.push(propertiesData)
    } while (gettingProperties);

    return {data: propertiesDataArr, newOffset: offset}
}