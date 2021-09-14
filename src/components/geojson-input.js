import React from 'react';

export default class GeoJsonInput extends React.Component {
    onSelect(e) {
      const { actions, setFileInfo } = this.props;
      const reader = new FileReader();
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      actions.setLoading(true);
      setFileInfo({geoJsonData:null, geoJsonFileName:null});
      reader.readAsText(file);
      const file_name = file.name;
      reader.onload = () => {
        let readdata = null;
        try {
          readdata = JSON.parse(reader.result.toString());
        } catch (exception) {
          actions.setLoading(false);
          window.alert(exception);
          return;
        }
        setFileInfo({geoJsonData:readdata, geoJsonFileName:file_name});
      };
    }
    onClick(e) {
      const { setFileInfo } = this.props;
      setFileInfo({geoJsonData:null, geoJsonFileName:null});
      document.getElementById("GeoJsonInput").value = '';
    }
    render() {
      const { id } = this.props;
      return (
        <input type="file" accept=".json"
        id={id}
        onClick={this.onClick.bind(this)}
        onChange={this.onSelect.bind(this)}
        />
      );
    }
  }
