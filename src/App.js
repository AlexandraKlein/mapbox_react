import React, { Component } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import styled from "@emotion/styled";
import geojson from "./geojson.json";

require("dotenv").config();

const StyledMap = styled.div`
  .mapgl-mapbox {
    min-height: 70vh;
    min-width: 100vw;
  }
`;

class App extends Component {
  state = {
    viewport: {
      width: 1200,
      height: 1000,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8,
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
    console.log({ map });
  };

  render() {
    return (
      <div className="App">
        <StyledMap>
          <ReactMapGL
            {...this.state.viewport}
            data={geojson}
            mapStyle="mapbox://styles/mbxsolutions/ck4ye87f3nlti1co2al1wpsnz"
            mapboxApiAccessToken={process.env.REACT_APP_MapboxAccessToken}
            onViewportChange={(viewport) => this.setState({ viewport })}
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
