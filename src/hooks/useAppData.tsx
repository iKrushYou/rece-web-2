import useLocalStorage from './useLocalStorage';
import ReceiptItem from '../types/ReceiptItem';
import Person from '../types/Person';
import { indexArray, setify } from '../functions/utils';
import React, {
  createContext,
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo
} from 'react';
import currency from 'currency.js';
import { v4 as uuidv4 } from 'uuid';

export interface AppDataEntity {
  items: ReceiptItem[];
  people: Person[];
  personToItemsMap: Record<string, string[]>;
  itemToPeopleMap: Record<string, string[]>;
  tip: number;
  tax: number;
}

const appDataDefaults = {
  items: [],
  people: [],
  personToItemsMap: {},
  itemToPeopleMap: {},
  tip: 0,
  tax: 0,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface AppDataContextProps {
  appData: AppDataEntity;
  setAppData: Dispatch<SetStateAction<AppDataEntity>>;
  reset: () => void;
  putItem: (newItem: ReceiptItem) => void;
  removeItem: (itemId: string) => void;
  splitItem: (itemId: string) => void;
  putPerson: (newPerson: Person) => void;
  removePerson: (personId: string) => void;
  handleSetItemPerson: (itemId: string, personIds: string[], selected: boolean) => void;
  itemCostMap: Record<string, number>;
  subTotal: number;
  total: number;
  subTotalForPerson: (personId: string) => number;
  taxForPerson: (personId: string) => number;
  tipForPerson: (personId: string) => number;
  totalForPerson: (personId: string) => number;
}

const AppDataContext = createContext<AppDataContextProps>({
  appData: appDataDefaults,
  setAppData: noop,
  reset: noop,
  putItem: noop,
  removeItem: noop,
  splitItem: noop,
  putPerson: noop,
  removePerson: noop,
  handleSetItemPerson: noop,
  itemCostMap: {},
  subTotal: 0,
  total: 0,
  subTotalForPerson: () => 0,
  taxForPerson: () => 0,
  tipForPerson: () => 0,
  totalForPerson: () => 0,
});

export const AppDataContextProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [appData, setAppData] = useLocalStorage<AppDataEntity>('appData', appDataDefaults);

  const reset = () => {
    setAppData(appDataDefaults);
  };

  const putItem = (newItem: ReceiptItem) => {
    setAppData((prev) => {
      const index = prev.items.map((item) => item.id).indexOf(newItem.id);
      if (index > -1) {
        prev.items[index] = newItem;
        return { ...prev, items: [...prev.items] };
      } else {
        return { ...prev, items: [...prev.items, newItem] };
      }
    });
  };

  const removeItem = (itemId: string) => {
    setAppData((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== itemId) }));
  };

  const splitItem = (itemId: string) => {
    const item = appData.items.find((item) => item.id === itemId);
    if (!item) return;
    const splitCount = parseInt(prompt(`How many items should (${item.name} - ${currency(item.cost).format()}) be split into?`) || '');
    if (!splitCount || isNaN(splitCount)) return;
    const newItems: ReceiptItem[] = indexArray(splitCount).map(() => ({
      id: uuidv4(),
      name: item.name,
      cost: item.cost / splitCount,
    }));
    setAppData((prev) => ({ ...prev, items: [...prev.items.filter((item) => item.id !== itemId), ...newItems] }));
  };

  const putPerson = (newPerson: Person) => {
    setAppData((prev) => {
      const index = prev.people.map((item) => item.id).indexOf(newPerson.id);
      if (index > -1) {
        prev.people[index] = newPerson;
        return { ...prev, people: [...prev.people] };
      } else {
        return { ...prev, people: [...prev.people, newPerson] };
      }
    });
  };

  const removePerson = (personId: string) => {
    setAppData((prev) => ({ ...prev, people: prev.people.filter((person) => person.id !== personId) }));
  };

  const handleSetItemPerson = (itemId: string, personIds: string[], selected: boolean) => {
    setAppData((prev) => {
      const { personToItemsMap, itemToPeopleMap } = prev;
      for (const personId of personIds) {
        if (!personToItemsMap[personId]) personToItemsMap[personId] = [];
        if (selected) {
          personToItemsMap[personId] = setify([...personToItemsMap[personId], itemId]);
        } else {
          personToItemsMap[personId] = personToItemsMap[personId].filter((_itemId) => _itemId !== itemId);
        }
        if (!itemToPeopleMap[itemId]) itemToPeopleMap[itemId] = [];
        if (selected) {
          itemToPeopleMap[itemId] = setify([...itemToPeopleMap[itemId], personId]);
        } else {
          itemToPeopleMap[itemId] = itemToPeopleMap[itemId].filter((_personId) => _personId !== personId);
        }
      }
      return { ...prev, personToItemsMap, itemToPeopleMap };
    });
  };

  const itemCostMap = useMemo<Record<string, number>>(() => {
    return appData.items.reduce((map, curr) => ({ ...map, [curr.id]: curr.cost }), {});
  }, [appData.items]);

  const subTotal = useMemo(
    () =>
      appData.items.reduce((previousValue, currentValue) => {
        return currency(previousValue).add(currentValue.cost).value;
      }, 0.0),
    [appData.items],
  );

  const total = currency(subTotal).add(appData.tax).add(appData.tip).value;

  const subTotalForPerson = (personId: string) =>
    appData.personToItemsMap[personId]?.reduce(
      (sum, itemId) => currency(sum).add(currency(itemCostMap[itemId]).divide(appData.itemToPeopleMap[itemId].length)).value,
      0.0,
    ) || 0;

  const percentForPerson = (personId: string) => subTotalForPerson(personId) / subTotal;

  const taxForPerson = (personId: string) => currency(appData.tax).multiply(percentForPerson(personId)).value;
  const tipForPerson = (personId: string) => currency(appData.tip).multiply(percentForPerson(personId)).value;

  const totalForPerson = (personId: string) =>
    currency(subTotalForPerson(personId)).add(taxForPerson(personId)).add(tipForPerson(personId)).value;

  return (
    <AppDataContext.Provider
      value={{
        appData,
        setAppData,
        reset,
        putItem,
        removeItem,
        splitItem,
        putPerson,
        removePerson,
        handleSetItemPerson,
        itemCostMap,
        subTotal,
        total,
        subTotalForPerson,
        taxForPerson,
        tipForPerson,
        totalForPerson,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

const useAppData = (): AppDataContextProps => useContext(AppDataContext);
export default useAppData;
