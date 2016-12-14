import React, { PropTypes } from 'react';
import { Card, CardTitle } from 'material-ui/Card';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import axios from 'axios';

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
            tilesData: [
                {
                    img: 'https://unsplash.it/200/300?image=0',
                    title: 'Breakfast',
                    author: 'jill111',
                },
                {
                    img: 'https://unsplash.it/200/300?image=1',
                    title: 'Tasty burger',
                    author: 'pashminu',
                },
                {
                    img: 'https://unsplash.it/200/300?image=2',
                    title: 'Camera',
                    author: 'Danson67',
                },
                {
                    img: 'https://unsplash.it/200/300?image=3',
                    title: 'Morning',
                    author: 'fancycrave1',
                },
                {
                    img: 'https://unsplash.it/200/300?image=4',
                    title: 'Hats',
                    author: 'Hans',
                },
                {
                    img: 'https://unsplash.it/200/300?image=5',
                    title: 'Honey',
                    author: 'fancycravel',
                },
                {
                    img: 'https://unsplash.it/200/300?image=6',
                    title: 'Vegetables',
                    author: 'jill111',
                },
                {
                    img: 'https://unsplash.it/200/300?image=7',
                    title: 'Water plant',
                    author: 'BkrmadtyaKarki',
                },
            ],
        };
    }

    componentDidMount() {
        axios.get('/playlist')
            .then(res => {
                this.setState({ tilesData: res.data });
                //console.log(res)
            });
    }

    itemClicked() {
        console.log("Item Clicked");
    }

    deleteItem() {
        console.log("Delete Item Clicked");
    }

    render() {
        return (
            <div style={this.state.styles.root}>
                <GridList className="container" style={this.state.styles.gridList} cols={2.2}>
                    {this.state.tilesData.map((tile, i) => (
                        <GridTile
                            key={i}
                            title={tile.title}
                            actionIcon={<IconButton onClick={this.deleteItem}><StarBorder color="rgb(0, 188, 212)" /></IconButton>}
                            titleStyle={this.state.styles.titleStyle}
                            titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                            >
                            <img style={this.state.styles.imageStyle} onClick={this.itemClicked} src={"https://image.tmdb.org/t/p/w200_and_h300_bestv2"+tile.image} />
                        </GridTile>
                    ))}
                </GridList>
            </div>
        );
    }

}

export default Playlist;