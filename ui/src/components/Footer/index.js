import React from "react";
import { Grid, Box, Link } from "@material-ui/core";
import { Twitter, GitHub, LinkedIn, Language } from "@material-ui/icons";

function Footer() {
  return (
    <Grid
      container
      style={{
        marginTop: "30px",
        paddingBottom: "40px",
        paddingTop: "30px",
        borderTop: "2px solid black",
        backgroundColor: "black",
      }}
    >
      <Grid item xs={3} />
      <Grid
        item
        xs={6}
        container
        justify="center"
        style={{
          paddingRight: "2rem",
        }}
      >
        <Grid container direction="column">
          <Box
            fontWeight="fontWeightBold"
            fontSize="1.75rem"
            fontFamily="fontFamily"
            fontStyle=""
            color="white"
          >
            Developed by:{" "}
            <Link
              href="https://apoorvlathey.com/"
              target="_blank"
              rel="noopener"
              style={{
                color: "white",
                textDecoration: "underline",
              }}
            >
              Apoorv Lathey
            </Link>
          </Box>
          <Grid
            item
            style={{
              marginTop: "1rem",
            }}
          >
            <Link
              href="https://apoorvlathey.com/"
              target="_blank"
              rel="noopener"
              style={{
                color: "white",
                padding: "1rem",
                paddingLeft: "0",
              }}
            >
              <Language />
            </Link>
            <Link
              href="https://twitter.com/apoorvlathey"
              target="_blank"
              rel="noopener"
              style={{
                color: "white",
                padding: "1rem",
              }}
            >
              <Twitter />
            </Link>
            <Link
              href="https://github.com/CodinMaster"
              target="_blank"
              rel="noopener"
              style={{
                color: "white",
                padding: "1rem",
              }}
            >
              <GitHub />
            </Link>
            <Link
              href="https://www.linkedin.com/in/apoorvlathey/"
              target="_blank"
              rel="noopener"
              style={{
                color: "white",
                padding: "1rem",
              }}
            >
              <LinkedIn />
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Footer;
