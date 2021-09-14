import React from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import {
  Container, connectToHarmowareVis, HarmoVisLayers, SimulationDateTime,
  ElapsedTimeRange, ElapsedTimeValue, SpeedValue, SpeedRange, MovesLayer, MovesInput,
  PlayButton, PauseButton, ForwardButton, ReverseButton, FpsDisplay
} from 'harmoware-vis';
import GeoJsonInput from '../components/geojson-input'

const MAPBOX_TOKEN = 'pk.eyJ1IjoieW11Y3lzdGsiLCJhIjoiY2oxdmhhbmd0MDAwYjM4bXd1YWVodWNrcCJ9.aWxoDc0UXMVGB96b82GFKQ'; //Acquire Mapbox accesstoken

class App extends Container {
  constructor(props) {
    super(props);
    this.props.actions.setInitialViewChange(false)
    this.props.actions.setLeading(0);
    this.props.actions.setTrailing(0);
    this.props.actions.setSecPerHour(60);
    this.props.actions.setViewport({zoom:15.0, pitch:0});
    this.state = {
      tilesetList: [
        "23202_okazaki",
        "23202_honcho",
        "23202_iwazu",
        "23202_mutsumi",
        "23202_nukata",
        "23202_ohira",
        "23202_tobu",
        "23202_yahagi",
      ],
      selecttileset: "23202_okazaki",
      geoJsonData: null,
      geoJsonFileName: null,
    };
  }
  getTileset(e){
    this.setState({ selecttileset: e.target.value });
  }
  setFileInfo(setState){
    this.setState(setState);
  }
  getFillColor(x){
    return [255,255,255];
  }

  render() {
    const { actions, inputFileName:{ movesFileName }, viewport, movesbase, movedData, settime, leading,
      timeBegin, timeLength, secperhour, animatePause, animateReverse, clickedObject, routePaths } = this.props;
    const { tilesetList, selecttileset, geoJsonData } = this.state;
    const Tile3DDataPath = '../../json/' + selecttileset + '/tileset.json';
    const getTileset = this.getTileset.bind(this);
    const setFileInfo = this.setFileInfo.bind(this);
    const getFillColor = this.getFillColor.bind(this);


    return (
      <div>
        <div className="harmovis_controller">
          <ul className="flex_list">
            <li className="flex_row">
              <div className="harmovis_input_button_row">
              <label htmlFor="MovesInput">
              Operation data<MovesInput actions={actions} id="MovesInput" />
              </label>
              <div>{movesFileName}</div>
              </div>
            </li>
            <li className="flex_column">
              <div>SelectTileset</div>
              <div className="form-select" title='SelectTileset'>
                <select id="SelectTileset" value={selecttileset} onChange={getTileset} >
                {tilesetList.map((x,i)=><option value={x} key={i}>{x}</option>)}
                </select>
              </div>
            </li>
            <li className="flex_row">
              <div className="harmovis_input_button_row">
              <label htmlFor="GeoJsonInput">
              GeoJson data<GeoJsonInput actions={actions} id="GeoJsonInput"
              setFileInfo={setFileInfo} />
              </label>
              <div>{this.state.geoJsonFileName}</div>
              </div>
            </li>
            <li className="flex_column">
              再現中日時&nbsp;<SimulationDateTime settime={settime} />
            </li>
            <li className="flex_row">
              <div className="harmovis_button">
                {animatePause ?
                  <PlayButton actions={actions} /> :
                  <PauseButton actions={actions} />
                }
                {animateReverse ?
                  <ForwardButton actions={actions} /> :
                  <ReverseButton actions={actions} />
                }
              </div>
            </li>
            <li className="flex_column">
              <label htmlFor="ElapsedTimeRange">経過時間
              <ElapsedTimeValue settime={settime} timeBegin={timeBegin} timeLength={timeLength} actions={actions} min={leading*-1} />&nbsp;/&nbsp;
              <input type="number" value={timeLength} onChange={e=>actions.setTimeLength(+e.target.value)} className="harmovis_input_number" min={0} max={timeLength} />&nbsp;秒
              </label>
              <ElapsedTimeRange settime={settime} timeLength={timeLength} timeBegin={timeBegin} actions={actions} min={leading*-1} id="ElapsedTimeRange" />
            </li>
            <li className="flex_column">
              <label htmlFor="SpeedRange">スピード<SpeedValue secperhour={secperhour} actions={actions} />秒/時</label>
              <SpeedRange secperhour={secperhour} actions={actions} id="SpeedRange" />
            </li>
          </ul>
        </div>
        <div className="harmovis_area">
          <HarmoVisLayers
            viewport={viewport} actions={actions}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapboxAddLayerValue={null}
            terrain={true}
            layers={[
              new MovesLayer({ movedData, optionVisible:false, pickable:false }),
              new Tile3DLayer({
                id: 'Tile3D-Layer-' + selecttileset,
                pointSize: 1,
                data: Tile3DDataPath,
                onTilesetLoad: (tileset) => {
                  const { cartographicCenter } = tileset;
                  const [longitude, latitude] = cartographicCenter;
                  actions.setViewport({longitude,latitude});
                  console.log(longitude, latitude);
                },
              }),
              geoJsonData ?
              new GeoJsonLayer({
                id: 'geojson-layer',
                data: geoJsonData,
                pickable: true,
                pointType: 'circle',
                extruded: false,
                opacity: 0.5,
                getFillColor
              }):null,
            ]}
          />
        </div>
        <FpsDisplay />
        <div className="harmovis_footer">
          <a href="https://www.geospatial.jp/ckan/dataset/plateau-23202-okazaki-shi-2020/resource/b8569a05-32a8-41bd-9440-d31218157780" rel="noopener noreferrer" target="_blank">
          3D都市モデル（Project PLATEAU）岡崎市（2020年度）を使用しています。</a>&nbsp;
          longitude:{viewport.longitude}&nbsp;
          latitude:{viewport.latitude}&nbsp;
          altitude:{viewport.altitude}&nbsp;
          zoom:{viewport.zoom}&nbsp;
          bearing:{viewport.bearing}&nbsp;
          pitch:{viewport.pitch}
        </div>
      </div>
    );
  }
}
export default connectToHarmowareVis(App);
