import React, { Component } from "react";
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  FlyToInterpolator,
  WebMercatorViewport,
  NavigationControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import styled from "@emotion/styled";
import geojson from "./counties.geojson";
require("dotenv").config();

const StyledMap = styled.div`
  position: relative;
  min-height: 70vh;
  min-width: 100vw;
  > div {
    position: absolute !important;
    cursor: pointer !important;
  }
`;

const StyledPopup = styled.div`
  .mapboxgl-popup-content {
    background-color: #162131;
    color: white;
    border-radius: 0;
    padding: 20px;
  }

  .mapboxgl-popup-tip {
    border-bottom-color: #162131 !important;
  }

  .mapboxgl-popup-close-button {
    color: white;
    font-size: 22px;
  }
`;

const StyledNavigation = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
`;

const featuredValue = "unemployment_rate";

const countyFillPaint = {
  "fill-opacity": 0.5,
  "fill-color": [
    "interpolate",
    ["linear"],
    ["get", "unemployment_rate"],
    0,
    "#F2F12D",
    1,
    "#EED322",
    2,
    "#E6B71E",
    3,
    "#DA9C20",
    4,
    "#CA8323",
    5,
    "#B86B25",
    6,
    "#A25626",
    7,
    "#8B4225",
    8,
    "#723122",
  ],
};

class App extends Component {
  static map = null;
  state = {
    popupContent: null,
    viewport: {
      latitude: 38.19302809153077,
      longitude: -96.87815987018907,
      zoom: 3.7,
      minZoom: 3.7,
    },
  };

  handlePopupContent = (event, feature) => {
    if (feature && feature.properties) {
      this.setState({
        popupContent: {
          latitude: event.lngLat[1],
          longitude: event.lngLat[0],
          state: feature.properties.STATE,
          county: feature.properties.NAME,
          description: feature.properties[featuredValue],
        },
      });
    } else {
      this.setState({
        popupContent: null,
      });
    }
  };

  handleZoomToCounty = (feature) => {
    console.log({ feature });

    if (!feature) {
      return;
    }
    const [minLng, minLat, maxLng, maxLat] = bbox(feature);
    const viewport = new WebMercatorViewport(this.state.viewport);
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 100,
      }
    );

    this.setState({
      viewport: {
        ...this.state.viewport,
        longitude,
        latitude,
        zoom,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 1000,
      },
    });
  };

  onMapClick = (event) => {
    const { features } = event;
    const feature = features.find(
      (feature) => feature.layer.id === "fill-layer"
    );

    this.handleZoomToCounty(feature);
    this.handlePopupContent(event, feature);
  };

  onMapLoaded = (map) => {
    this.map = map;
    console.log(this.map);
  };

  onViewportChange = (viewport) => {
    this.setState({ viewport });
  };

  render() {
    const { viewport, popupContent } = this.state;
    return (
      <div className="App">
        <StyledMap>
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%"
            data={geojson}
            mapStyle="mapbox://styles/aliklein/ckigegvln5iyv19s4rerox2wo"
            mapboxApiAccessToken={process.env.REACT_APP_MapboxAccessToken}
            onViewportChange={(viewport) => this.onViewportChange(viewport)}
            onClick={this.onMapClick}
            onLoad={this.onMapLoaded}
            className="mapgl-mapbox"
          >
            <Source id="my-data" type="geojson" data={geojson}>
              <Layer id="fill-layer" type="fill" paint={countyFillPaint} />

              {popupContent && popupContent.latitude && popupContent.longitude && (
                <StyledPopup>
                  <Popup
                    latitude={popupContent.latitude}
                    longitude={popupContent.longitude}
                    closeButton={true}
                    closeOnClick={false}
                    onClose={() => this.setState({ popupContent: null })}
                    anchor="top"
                  >
                    <div>
                      <h3>
                        {popupContent.county} County, {popupContent.state}
                      </h3>
                      <p>Unemployment Rate: {popupContent.description}</p>
                    </div>
                  </Popup>
                </StyledPopup>
              )}
            </Source>
            <StyledNavigation>
              <NavigationControl />
            </StyledNavigation>
          </ReactMapGL>
        </StyledMap>
      </div>
    );
  }
}

export default App;
