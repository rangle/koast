/* global exports */

exports.schemas = [{
  name: 'widgets',
  properties: {
    widgetNumber: {
      type: Number,
      required: true,
      unique: true
    },
    widgetName: {
      type: String
    }
  }
}];