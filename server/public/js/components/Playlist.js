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
                    color: 'rgb(0, 188, 212)',
                },
                imageStyle: {
                    height: 300,
                    width: 200,
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
            <div style={this.state.styles.root}>
                <GridList className="container" style={this.state.styles.gridList} cols={2.2}>
                    {this.state.tilesData.map((tile, i) => (
                        <GridTile
                            key={i}
                            title={tile.title}
                            actionIcon={<IconButton onClick={this.deleteItem.bind(this, i)}><DeleteForever color="rgb(0, 188, 212)" /></IconButton>}
                            titleStyle={this.state.styles.titleStyle}
                            titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                            >
                            <img style={this.state.styles.imageStyle} onClick={this.itemClicked.bind(this, tile._id)} src={"https://image.tmdb.org/t/p/w200_and_h300_bestv2/" + tile.image} />

                        </GridTile>
                    ))}
                </GridList>
            </div>
        );
    }

}

export default Playlist;