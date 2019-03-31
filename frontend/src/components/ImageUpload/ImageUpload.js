import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ImageUpload extends Component {
  static propTypes = {
    setSelectedPhoto: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      imagePreviewUrl: ''
    };
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];
    if (file) {
      reader.onloadend = () => {
        this.setState({
          imagePreviewUrl: reader.result
        });
        this.props.setSelectedPhoto(file);
      }
      reader.readAsDataURL(file);
    }
  }

  render() {
    let {imagePreviewUrl} = this.state;

    return (
      <div className="previewComponent">
        <input
          className="fileInput"
          type="file"
          onChange={(e)=>this._handleImageChange(e)} />
        <div className="imgPreview">
          {imagePreviewUrl
            ? <img src={imagePreviewUrl} width="450px" height="200px" alt="Preview" />
            : null
          }
        </div>
      </div>
    )
  }
}

export default ImageUpload;