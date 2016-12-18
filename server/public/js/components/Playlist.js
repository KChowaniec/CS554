import React, { PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import DeleteForever from 'material-ui/svg-icons/action/delete-forever';
import axios from 'axios';
import { browserHistory } from 'react-router';
import GetApp from 'material-ui/svg-icons/action/get-app'; // for exporting
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'; // for Import
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';


class Playlist extends React.Component {

    constructor(props) {
        super(props);

        // set the initial component state
        this.state = {
            styles: {
                root: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                },
                gridList: {
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                },
                titleStyle: {
                    color: 'rgb(0, 0, 0)',
                    fontWeight: 'bold'
                },
                imageStyle: {
                    height: '200px',
                    width: '200px',
                },
                imageInput: {
                    cursor: 'pointer',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    width: '100%',
                    opacity: 0,
                },
            },
            tilesData: [],
            import_open: false,
            import_file: null,
        };
    }

    componentDidMount() {
        axios.get('/playlist')
            .then(res => {
                this.setState({ tilesData: res.data });
            });
    }

    itemClicked(id) {
        console.log("Item Clicked: " + id);
        browserHistory.push('/movie/' + id);
    }

    deleteItem(index) {
        console.log("delete movie : " + index)
        axios.delete('/playlist/delete/' + this.state.tilesData[index]._id)
            .then(res => {
                if (res.data.success === true) {
                    return axios.get('/playlist');
                }
            }).then(res => {
                this.setState({ tilesData: res.data });
            });
    }

    handleFile(e) {
        let self = this;

        var file = e.target.files[0];
        self.setState({
            import_file: e.target.files[0],
        });
    }


    onFormSubmit(event) {
        event.preventDefault();
        console.log("Form Submit Clicked");
        let self = this;
        var reader = new FileReader();
        reader.onload = function (upload) {
            var contents = reader.result;

            axios({
                method: 'post',
                url: '/playlist/import',
                data: {
                    playlist_data: JSON.parse(contents),
                },
                dataType: "json",
                contentType: "application/json",
            }).then((res) => {
                //console.log(res);
                if (res.data.success === true) {
                    return axios.get('/playlist');
                }
            }).then(res => {
                self.setState({
                    tilesData: res.data,
                    import_open: false
                });
            });
            /*console.log(JSON.parse(contents));
            self.setState({
                tilesData: JSON.parse(contents),
                import_open: false
            })*/
        }

        reader.onloadend = function () {
            console.log("in load Ended")
        }
        if (this.state.import_file) {
            reader.readAsText(this.state.import_file);
        }


    }
    handleOpen() {
        console.log("Import Dialog opened : " + this.state.import_open);
        this.setState({ import_open: true });
    }
    handleOpen_empty() {
        console.log("empty Import Dialog opened : " + this.state.import_open);
        this.setState({ import_open: true });
    }

    handleClose() {
        this.setState({ import_open: false });
    }

    render() {
        return (
            <div>
                {this.state.tilesData.length > 0 ? (
                    <Card className="container">
                        <CardTitle title="My Playlist" />
                        <FlatButton label="Import"
                            labelPosition="before"
                            icon={<OpenInBrowser />}
                            onClick={this.handleOpen.bind(this)}
                            >
                        </FlatButton>
                        <FlatButton label="Export"
                            href="/playlist/download"
                            labelPosition="before"
                            icon={<GetApp />}
                            >
                        </FlatButton>
                        <br /><br />

                        <div style={this.state.styles.root}>
                            <GridList style={this.state.styles.gridList} cols={2.2}>
                                {this.state.tilesData.map((tile, i) => (
                                    <GridTile
                                        key={i}
                                        title={tile.title}
                                        actionIcon={<IconButton onClick={this.deleteItem.bind(this, i)}><DeleteForever color="rgb(0, 0, 0)" /></IconButton>}
                                        titleStyle={this.state.styles.titleStyle}
                                        titleBackground="linear-gradient(to top, rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.7) 70%,rgba(255,255,255,0.6) 100%)"
                                        >
                                        <img className="grid-img" style={this.state.styles.imageStyle} onClick={this.itemClicked.bind(this, tile._id)}
                                            src={tile.image === null ? "/public/images/movie-icon.png" : "https://image.tmdb.org/t/p/w300_and_h450_bestv2/" + tile.image} />

                                    </GridTile>
                                ))}
                            </GridList>
                        </div>
                        <br /><br />
                    </Card>
                ) : (
                        <Card className="container">
                            <CardTitle title="My Playlist" subtitle="No Movies in your playlist" />
                            <FlatButton label="Import Playlist"
                                labelPosition="before"
                                icon={<OpenInBrowser />}
                                onClick={this.handleOpen.bind(this)}
                                >
                            </FlatButton>
                            <br/><br/>
                        </Card>
                    )}
                <Dialog
                    title="Upload Your File"
                    modal={false}
                    open={this.state.import_open}
                    onRequestClose={this.handleClose.bind(this)}
                    >
                    <form className="form-inline" onSubmit={this.onFormSubmit.bind(this)}>
                        <div className="row form-group">
                            <div className="col-sm-8">
                                <input className="btn btn-default" type="file" onChange={this.handleFile.bind(this)} placeholder="Upload file..." name="userfile" accept=".json" />
                            </div>
                            <div className="col-sm-2">
                                <RaisedButton label="Upload"
                                    type="submit"
                                    primary={true}
                                    />
                            </div>
                            <div className="col-sm-2">
                                <RaisedButton label="Cancel"
                                    onClick={this.handleClose.bind(this)}
                                    />
                            </div>
                        </div>
                    </form>
                </Dialog>
            </div>

        );
    }

}

export default Playlist;