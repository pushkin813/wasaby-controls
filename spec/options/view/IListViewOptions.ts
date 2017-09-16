import IGroupedItemsViewOptions = require("options/common/IGroupedViewOptions");
import IItemTemplate = require("interfaces/IItemTemplate");
import IItemAction = require("interfaces/IItemAction");
import IItem = require("interfaces/IItem")
import IItemsViewOptions = require("./IItemsViewOptions");


interface IListViewOptions
    extends IItemsViewOptions,
            IGroupedItemsViewOptions{
    itemsActions?: Array<IItemAction>,
    idProperty: string | null, //не понятно. хотелось бы без него
    //selection: IMultiSelection, //пока непонятно что это такое. нужна информация только для отображения.
    editingTemplate?: IItemTemplate,
    selectedItem: IItem | null
}

export = IListViewOptions;