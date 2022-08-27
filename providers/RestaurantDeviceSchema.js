import {ObjectId} from 'bson';

const RestaurantDeviceSchema = {
  name: 'restaurant_device',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    restaurant_id: 'string',
    platform: 'string',
    app_version: 'string',
    device_model: 'string',
    uid: 'string',
    created_at: 'date',
    platform_version: 'string',
  },
};

export {RestaurantDeviceSchema};
