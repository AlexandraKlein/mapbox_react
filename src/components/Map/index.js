import React, { Component } from "react";
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  FlyToInterpolator,
  WebMercatorViewport,
  //NavigationControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import styled from "@emotion/styled";
import resetIcon from "../../assets/reset-map.svg";
require("dotenv").config();

const featuredValue = "unemployment_rate";

const countyFillPaint = {
  "fill-opacity": 0.5,
  "fill-color": [
    "interpolate",
    ["linear"],
    ["get", featuredValue],
    3,
    "#A25626",
    5,
    "#8B4225",
    7,
    "#723122",
  ],
};

const visualCenter = {
  latitude: 38.82811,
  longitude: -95.57962,
  zoom: 3.7,
};

class Map extends Component {
  static map = null;
  state = {
    geojson: null,
    isLoading: false,
    error: null,
    popupContent: null,
    viewport: {
      ...visualCenter,
    },
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    fetch(
      "https://raw.githubusercontent.com/AlexandraKlein/mapbox_react/master/src/counties.geojson"
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then((data) => this.setState({ geojson: data, isLoading: false }))
      .catch((error) => this.setState({ error, isLoading: false }));
  }

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
    if (!feature) {
      return;
    }
    console.log(feature);
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

  handleResetZoom = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        ...visualCenter,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 1000,
      },
      popupContent: null,
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
    console.log({ viewport });
  };

  render() {
    const { geojson, error, isLoading, viewport, popupContent } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return <p>Loading ...</p>;
    }
    return (
      <StyledMap>
        <ReactMapGL
          {...viewport}
          width="100%"
          height="100%"
          data={geojson}
          mapStyle="mapbox://styles/aliklein/ckihnflpe05gi1aooaicxo7t9"
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
                  className="blvd-custom-popup"
                  latitude={popupContent.latitude}
                  longitude={popupContent.longitude}
                  closeButton={true}
                  dynamicPosition={false}
                  onClose={() => this.setState({ popupContent: null })}
                  anchor="top"
                  tipSize={0}
                >
                  <div>
                    <h3 className="font-monospace">
                      {popupContent.county} County, {popupContent.state}
                    </h3>
                    <p>Status: {popupContent.description}</p>
                  </div>
                </Popup>
              </StyledPopup>
            )}
          </Source>
          {/* <StyledNavigation>
            <NavigationControl />
          </StyledNavigation> */}
        </ReactMapGL>
        <ResetButton className="font-monospace" onClick={this.handleResetZoom}>
          <img src={resetIcon} alt="Reset Map" />
        </ResetButton>
      </StyledMap>
    );
  }
}

export default Map;

const popupColor = "#242424";

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
  .blvd-custom-popup {
    .mapboxgl-popup-content {
      background-color: ${popupColor};
      color: white;
      border-radius: 0;
      padding: 20px;
    }

    .mapboxgl-popup-tip {
      border-bottom-color: ${popupColor};
    }

    .mapboxgl-popup-close-button {
      color: white;
      font-size: 22px;
      padding: 5px 10px;
    }
  }
`;

const ResetButton = styled.button`
  position: absolute;
  bottom: 40px;
  right: 20px;
  z-index: 1;
  color: white;
  width: 30px;
  height: 30px;
`;

// const StyledNavigation = styled.div`
//   position: absolute;
//   right: 20px;
//   top: 20px;
// `;
