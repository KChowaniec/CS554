import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import axios from 'axios';

class Movie extends React.Component {

    constructor(props) {
    super(props);
    this.state = {
        open: false,
        intreviews : [],
        errorText:'',
        errorVisibility: false,
    };
    this.addMovie = this.addMovie.bind(this);
    this.addReview = this.addReview.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

    handleTouchTap(event){
        event.preventDefault();

        this.setState({
          open: true,
          anchorEl: event.currentTarget
        });
    };

    handleRequestClose(){
        this.setState({
          open: false,
        });
      };

    addMovie () {
        axios.get('/playlist/addmovie/' + this.props.movie._id)
          .then(res => {
            if (res.data.success)
            {
                // alert("Movie has been successfully added to your playlist!");

                this.setState({errorVisibility:true});
                this.setState({errorText:'Movie has been successfully added to your playlist!'});
            }
            else{
                // alert(res.data.error);
                this.setState({errorVisibility:true});
                this.setState({errorText:res.data.error});
            }
        });
    }

    addReview () {
        axios.post('/movies/reviews/add/',{movieId:this.props.movie._id,review:document.getElementById("review").value})
            .then(res => {
                if (res.data.success)
                {
                    // alert("Your review has been added!");
                    this.setState({errorVisibility:true});
                    this.setState({errorText:"Your review has been added!"});
                    var idtmp = new Date();
                    this.props.intreviews.push({id:idtmp.getTime(),name:decodeURI(res.data.result.name),comment:document.getElementById("review").value})
                    this.setState({intreviews:this.props.intreviews});
                }
                else{
                    this.setState({errorVisibility:true});
                    this.setState({errorText:res.data.error});
                }
                this.setState({
                  open: false
                });
            });
    }

    render() {
        const styles = {
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
        };
        var recsTiles = this.props.recs.map(function(rec,i) {
            return (<GridTile
                  key={rec.id}
                  title={rec.title}
                  actionIcon={<IconButton><StarBorder color='rgb(0, 188, 212)' /></IconButton>}
                  titleStyle={styles.titleStyle}
                  titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                >
                  <a href={'/movie/' + rec.id}><img src={'https://image.tmdb.org/t/p/w300_and_h450_bestv2/' + rec.poster_path} style={{width:'180px'}}/></a>
                </GridTile>);
        });
        var revs = "";
        if (this.props.reviews && this.props.reviews.length > 0)
        {
            revs = this.props.reviews.map(function (rec,i){
                return (
                    <ListItem
                      key={Math.floor((Math.random() * 10000000) + 1)}
                      primaryText={rec.author}
                      secondaryText={rec.content}
                      secondaryTextLines={2}
                    />
                );
            });
        }
        var intrevs = "";
        if (this.props.intreviews && this.props.intreviews.length > 0)
        {
            intrevs = this.props.intreviews.map(function (rec,i){

                return (
                    <ListItem
                      key={Math.floor((Math.random() * 10000000) + 1)}
                      primaryText={decodeURI(rec.name)}
                      secondaryText={rec.comment}
                      secondaryTextLines={2}
                    />
                );
            });
        }


        return (
                <Card style={{width:'70%',margin: '0 auto',color:'#1976d2'}}>
                    <CardHeader title={this.props.movie.title} subtitle={this.props.movie.releaseDate} titleColor="#00bcd4" titleStyle={{fontSize:'30px',fontWeight:'bold'}} children={<a href="#" onClick={() => this.addMovie()}><RaisedButton label="Add To Playlist" primary={true} style={{float:'right'}} /></a>} />
                    <CardText>
                        <div style={{float:'left',maxWidth:'300px'}}>

                          <img src={'https://image.tmdb.org/t/p/w300_and_h450_bestv2/' + this.props.movie.poster_path} style={{maxWidth:'300px'}}  />
                        </div>
                        <div style={{float:'left',maxWidth:'500px',marginLeft:'10px'}}>
                            <h2>Overview</h2>
                            {this.props.movie.description}<br/>
                            <br/>
                            <RaisedButton label="Write Review" primary={true} onTouchTap={this.handleTouchTap} />
                            <Popover
                              open={this.state.open}
                              anchorEl={this.state.anchorEl}
                              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                              targetOrigin={{horizontal: 'left', vertical: 'top'}}
                              onRequestClose={this.handleRequestClose}
                              animation={PopoverAnimationVertical}
                            >
                                <TextField
                                  multiLine={true}
                                  rows={6}
                                  rowsMax={6}
                                  id="review"
                               />
                                <a href="#" onClick={() => this.addReview()}><RaisedButton label="Submit" primary={true} /></a>
                            </Popover>
                        </div>
                        <div style={{clear:'both',paddingTop:'10px'}}>
                            <h4>If you loved {this.props.movie.title}, you would like these:</h4>
                            <div style={styles.root}>
                                <GridList style={styles.gridList} cols={2.2}>
                                    {recsTiles}
                                </GridList>
                            </div>
                            <List key="internal-reviews">
                                {intrevs != "" &&
                                <h3>Internal Reviews</h3>
                                }
                                {intrevs}
                            </List>
                            <List key="reviews">
                                {revs != "" &&
                                <h3>Movie Reviews From MovieDB.com</h3>
                                }
                                {revs}
                            </List>
                        </div>
                    </CardText>
                    <Snackbar
                        open={this.state.errorVisibility}
                        message={this.state.errorText}
                        autoHideDuration={4000}
                    />
              </Card>
            );
    }

}
export default Movie;
