import React from "react";
import { Grid, Paper, Typography } from "@material-ui/core";

const TokenPriceBox = ({ name, price }) => (
  <Grid item xs={3}>
    <Paper
      elevation={0}
      style={{
        padding: "2rem 3rem",
        border: "2px solid black",
      }}
    >
      <Grid
        container
        direction="row"
        alignItems="center"
        style={{
          minHeight: "100%",
        }}
      >
        <Typography
          variant="body2"
          display="inline"
          gutterBottom
          style={{
            fontWeight: "bold",
            paddingLeft: "1rem",
          }}
        >
          {name} @ ${price}
        </Typography>
      </Grid>
    </Paper>
  </Grid>
);

export default TokenPriceBox;
