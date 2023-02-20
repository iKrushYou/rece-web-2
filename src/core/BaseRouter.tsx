import {FunctionComponent} from "react";
import { generatePath, Redirect, Route, Switch } from 'react-router-dom';
import ReceiptsPage from "../pages/RceiptsPage";
import ReceiptInfoPage from "../pages/ReceiptInfoPage";

const RECEIPTS_PATH = `/receipts`;
const receipts = {
    path: RECEIPTS_PATH,
    route: (): string => RECEIPTS_PATH,
};

export type ReceiptInfoPathProps = {
    receiptId: string;
};
const RECEIPT_INFO_PATH = `/receipts/:receiptId`;
const receiptInfo = {
    path: RECEIPT_INFO_PATH,
    route: (params: ReceiptInfoPathProps): string => generatePath(RECEIPT_INFO_PATH, params),
};

export const ReceiptInfoTabs = ['items', 'people'] as const;
export type ReceiptInfoTab = typeof ReceiptInfoTabs[number];
export type ReceiptInfoTabPathProps = ReceiptInfoPathProps & {
    tab: ReceiptInfoTab;
};
const RECEIPT_INFO_TAB_PATH = `/receipts/:receiptId/:tab?`;
const receiptInfoTab = {
    path: RECEIPT_INFO_TAB_PATH,
    route: (params: ReceiptInfoTabPathProps): string => generatePath(RECEIPT_INFO_TAB_PATH, params),
};

export const Routes = {
    receipts: {
        ...receipts,
        info: receiptInfo,
        infoTab: receiptInfoTab
    }
};

const BaseRouter: FunctionComponent = () => {
    return (
        <Switch>
            <Redirect to={Routes.receipts.path} from={'/'} exact />
            <Route path={Routes.receipts.path} exact component={ReceiptsPage} />
            <Route path={Routes.receipts.info.path} component={ReceiptInfoPage} />
        </Switch>
    )
}

export default BaseRouter;