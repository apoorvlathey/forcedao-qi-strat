import React from "react";
import { Grid, Box } from "@material-ui/core";
import ConnectWallet from "./ConnectWallet";
import truncateWithDots from "../../utils/truncateWithDots";

function NavBar({ web3, setWeb3, account, setAccount }) {
  return (
    <Grid
      container
      style={{
        marginBottom: "40px",
        marginTop: "40px",
        paddingBottom: "30px",
        borderBottom: "2px solid black",
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
        <Box
          fontWeight="fontWeightBold"
          fontSize="2.5rem"
          fontFamily="fontFamily"
          fontStyle=""
          color="#673ab7"
        >
          🚜 QI/MAI Strategy Dashboard 👨‍🌾
        </Box>
      </Grid>
      <Grid
        item
        xs={3}
        container
        justify="flex-end"
        style={{
          paddingRight: "2rem",
        }}
      >
        {!web3 ? (
          <ConnectWallet setWeb3={setWeb3} setAccount={setAccount} />
        ) : (
          <Grid container direction="column" alignItems="flex-end">
            <Grid item>
              <Box
                fontWeight="fontWeightBold"
                fontSize="1.2rem"
                fontFamily="fontFamily"
                fontStyle=""
                style={{
                  color: "green",
                  marginRight: "0.5rem",
                }}
              >
                • Connected
              </Box>
            </Grid>
            <Grid item>
              <Box
                fontWeight="fontWeightBold"
                fontFamily="fontFamily"
                style={{
                  color: "#04ad04",
                }}
              >
                {`(${truncateWithDots(account)})`}
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default NavBar;
