import {FunctionComponent, PropsWithChildren} from "react";
import {Card} from "@mui/material";
import Typography from "@mui/material/Typography";

const LoadingContainer: FunctionComponent<PropsWithChildren<{ isLoading: boolean }>> = ({children, isLoading}) => {
    return <>{isLoading ? (
        <Card sx={{padding: '10px'}}>
            <Typography>Loading...</Typography>
        </Card>
    ) : children}</>
}

export default LoadingContainer;
