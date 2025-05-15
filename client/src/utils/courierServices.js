export const courierServices = [
  {
    name: 'FedEx',
    value: 'fedex',
    getTrackingUrl: (trackingNumber) => `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  },
  {
    name: 'DHL',
    value: 'dhl',
    getTrackingUrl: (trackingNumber) => `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  },
  {
    name: 'UPS',
    value: 'ups',
    getTrackingUrl: (trackingNumber) => `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`
  },
  {
    name: 'USPS',
    value: 'usps',
    getTrackingUrl: (trackingNumber) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  },
  {
    name: 'BlueDart',
    value: 'bluedart',
    getTrackingUrl: (trackingNumber) => `https://www.bluedart.com/tracking/${trackingNumber}`
  },
  {
    name: 'DTDC',
    value: 'dtdc',
    getTrackingUrl: (trackingNumber) => `https://tracking.dtdc.com/ctbs-tracking/customerInterface.tr?submitName=showCITrackingDetails&cType=Consignment&cnNo=${trackingNumber}`
  },
  {
    name: 'Delhivery',
    value: 'delhivery',
    getTrackingUrl: (trackingNumber) => `https://www.delhivery.com/track/package/${trackingNumber}`
  },
  {
    name: 'India Post',
    value: 'indiapost',
    getTrackingUrl: (trackingNumber) => `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx?ConsignmentNo=${trackingNumber}`
  },
  {
    name: 'Other',
    value: 'other',
    getTrackingUrl: () => ''
  }
]; 