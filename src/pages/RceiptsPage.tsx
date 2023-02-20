import {FunctionComponent, useMemo} from "react";
import {ReceiptEntity, useGetReceipts} from "../functions/firebase";
import {DateTime} from "luxon";
import {Routes} from "../core/BaseRouter";
import UnstyledLink from "../components/UnstyledLink";

const ReceiptsPage: FunctionComponent = () => {
    const {receipts, isLoading} = useGetReceipts();

    const receiptsSorted = useMemo(() => receipts.sort((a, b) => b.date - a.date), [receipts])

    return (
        <>
            <h1>Receipts</h1>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <div style={{display: 'flex', flex: 1, flexDirection: "column", maxWidth: 600, gap: 10}}>
                    {receiptsSorted.map(receipt => <ReceiptInfoRow key={receipt.id} receipt={receipt}/>)}
                </div>
            </div>
        </>
    )
}

export default ReceiptsPage;

const ReceiptInfoRow: FunctionComponent<{ receipt: ReceiptEntity }> = ({receipt}) => {
    const dt = DateTime.fromMillis(receipt.date)
    return (
        <UnstyledLink to={Routes.receipts.info.route({receiptId: receipt.id})}>
            <div style={{
                backgroundColor: '#EEE',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
            }}
            >
                <div style={{display: 'flex', flexDirection: 'column', flex: 1, gap: '6px'}}>
                    <h3 style={{margin: 0, color: '#222'}}>{receipt.title}</h3>
                    <h5 style={{margin: 0, color: '#666'}}>{dt.toLocaleString(DateTime.DATE_MED)}</h5>
                </div>
                <div style={{
                    fontSize: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'center'
                }}>&#8250;</div>
            </div>
        </UnstyledLink>
    )
}