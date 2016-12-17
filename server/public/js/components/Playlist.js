import React, { PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import DeleteForever from 'material-ui/svg-icons/action/delete-forever';
import axios from 'axios';
import { browserHistory } from 'react-router';

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
            },
            tilesData: [],
        };
    }

    componentDidMount() {
        axios.get('/playlist')
            .then(res => {
                this.setState({ tilesData: res.data });
                //console.log(res)
            });
    }

    itemClicked(id) {
        console.log("Item Clicked: " + id);
        browserHistory.push('/movie/' + id);
    }

    deleteItem(index) {

        axios.delete('/playlist/movie/' + this.state.tilesData[index]._id)
            .then(res => {
                if (res.data.success === true) {
                    return axios.get('/playlist');
                }
            }).then(res => {
                this.setState({ tilesData: res.data });
                //console.log(res)
            });
        //console.log("Delete Item Clicked : " + index + " - Movie ID : " + this.state.tilesData[index]._id);

        // code to delete item from array
        /*var newArr = this.state.tilesData.filter(function (itm, i) {
            return i !== index;
        });
        this.setState({ tilesData: newArr });*/
    }

    render() {
        return (
            <div>
                {this.state.tilesData.length > 0 ? (<div style={this.state.styles.root}>
                    <GridList className="container" style={this.state.styles.gridList} cols={2.2}>
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
                </div>) : (
                        <Card className="container">
                            <CardTitle title="My Playlist" subtitle="No Movies in your playlist" />
                        </Card>
                    )}
            </div>

        );
    }

}

export default Playlist;