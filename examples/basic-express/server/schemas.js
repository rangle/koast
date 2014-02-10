/* global exports */

exports.schemas = [{
  name: 'robots',
  properties: {
    robotNumber: {
      type: Number,
      required: true,
      unique: true
    },
    robotName: {
      type: String
    },
    owner: {
      type: String
    }
  }
}, {
  name: 'babyRobots',
  properties: {
    parentNumber: {
      type: Number,
      required: true
    },
    babyNumber: {
      type: Number,
      required: true
    }, // unique among siblings
    babyRobotName: {
      type: String
    }
  },
  indices: [
    [{
      parentNumber: 1,
      babyNumber: 1
    }, {
      unique: true
    }]
  ]
}];