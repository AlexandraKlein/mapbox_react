import React, { Component } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import styled from "@emotion/styled";
import geojson from "./geojson.json";
require("dotenv").config();

const StyledMap = styled.div`
  position: relative;
  min-height: 70vh;
  min-width: 100vw;
  > div {
    position: absolute !important;
  }
`;

class App extends Component {
  state = {
    viewport: {
      latitude: 38.19302809153077,
      longitude: -96.87815987018907,
      zoom: 3.7,
    },
  };

  onMapClick = (event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;

    const feature = features.find(
      (feature) => feature.layer.id === "fill-layer"
    );

    console.log(feature);
  };

  onMapLoaded = (map) => {
    this.map = map;
  };

  onViewportChange = (viewport) => {
    this.setState({ viewport });
  };

  render() {
    const { viewport } = this.state;
    return (
      <div className="App">
        <StyledMap>
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%"
            data={geojson}
            mapStyle="mapbox://styles/mbxsolutions/ck4ye87f3nlti1co2al1wpsnz"
            mapboxApiAccessToken={process.env.REACT_APP_MapboxAccessToken}
            onViewportChange={(viewport) => this.onViewportChange(viewport)}
            onClick={this.onMapClick}
            onLoad={this.onMapLoaded}
            className="mapgl-mapbox"
          >
            <Source id="my-data" type="geojson" data={geojson}>
              <Layer
                id="fill-layer"
                type="fill"
                paint={{
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
                }}
              />
            </Source>
          </ReactMapGL>
        </StyledMap>
      </div>
    );
  }
}

export default App;
