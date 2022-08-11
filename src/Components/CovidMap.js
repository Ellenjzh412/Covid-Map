import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import { CovidDatService } from '../Service/CovidDataService';
import { MapUtils } from '../utils/MapUtils';
import CaseCard from './CaseCard';


class CovidMap extends Component {
  static defaultProps = {
    center: {
      lat: 40,
      lng: -95
    },
    zoom: 6
  };

  state ={ //放的是有状态的data，会出发covideMap的rerender
    points :{}, //{}表示是一个空的js object , 有state level, county level data 
    zoomLevel: 6,
    boundary: {} //js object 有4个field, nwes

  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyBt3fzqNaswkPzVgy7Pg_nk8ckvN8IG1Kg" }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          onGoogleApiLoaded = { 
            () => { //剪头函数
                CovidDatService.getAllCountyCases()
                .then(response => {
                    this.setState({
                        points: MapUtils.convertCovidPoints(response.data) //points改变导致触发rerender 
                    });
                }).catch(error => console.log(error));
            }
          }
          onChange = {
            ({center, zoom, bounds, marginBounds}) => {
                this.setState({
                    zoomLevel: zoom,
                    boundary: bounds
                });
            }
          }
        >
        
        {this.renderCovidPoints()}  
            
        </GoogleMapReact> 
      </div>
    );
  }

  renderCovidPoints(){
    let result = [];

    const zoomLevel = this.state.zoomLevel;
    // 1 - 4 nation level
    // 5 - 9 state level
    // 10 - 20 county level 
    let pointsLevel = 'county';
    if (zoomLevel >= 1 && zoomLevel <= 4){
        pointsLevel = 'nation';
    } else if (zoomLevel > 4 && zoomLevel <= 8){
        pointsLevel = 'state';
    }
    
    const pointsToRender = this.state.points[pointsLevel];
    // sanity check， api call haven't got any response yet 
    if (!pointsToRender){ //如果还没call api, 这个就是空的，所以要检查，第一次call render的时候会是空的
        return result;
    }

    if(pointsLevel === 'county'){
        for( const point of pointsToRender){ //因为一个是 array(county), 一个是state{要用不一样的loop(因为是{map}) }
            if(MapUtils.isInBoundary(this.state.boundary, point.coordinates)){ //现在还是js object, 还不是react component来hold这些data
                result.push(
                    <CaseCard
                    lat={point.coordinates.latitude}
                    lng={point.coordinates.longitude}
                    title={point.province}
                    subTitle={point.county}
                    confirmed={point.stats.confirmed}
                    deaths={point.stats.deaths}
                    />
                )
            }
        } 
    }else if (pointsLevel === 'state') {
        for (const state in pointsToRender) { //为什么这里是state而不是point,因为这里是map, 这个state是key
            const point = pointsToRender[state];
            if (MapUtils.isInBoundary(this.state.boundary, point.coordinates)) {
                result.push(
                    <CaseCard
                        lat={point.coordinates.latitude}
                        lng={point.coordinates.longitude}
                        title={point.country}
                        subTitle={state}
                        confirmed={point.confirmed}
                        deaths={point.deaths}
                    />
                )
            }
        }
    }

    return result;
  }

}

export default CovidMap;