/**
 * Библиотека поля выбора из справочника.
 * @library Controls/lookup
 * @includes Selector Controls/_lookup/Button
 * @includes Input Controls/_lookup/Lookup
 * @includes MultipleInput Controls/_lookup/MultipleInput
 * @includes Collection Controls/_lookup/SelectedCollection
 * @includes ItemTemplate wml!Controls/_lookup/SelectedCollection/ItemTemplate
 * @includes Opener Controls/_lookup/Opener
 * @includes LookupStyles Controls/_lookup/Lookup/LookupStyles
 * @includes SelectorButtonStyles Controls/_lookup/Button/SelectorButtonStyles
 * @includes LookupLinkStyles Controls/_lookup/Lookup/Link/LookupLinkStyles
 * @includes SelectedCollectionStyles Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * @includes ButtonItemTemplate wml!Controls/_lookup/Button/itemTemplate
 * @includes Link Controls/_lookup/Lookup/Link
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Lookup library
 * @library Controls/lookup
 * @includes Selector Controls/_lookup/Button
 * @includes Input Controls/_lookup/Lookup
 * @includes MultipleInput Controls/_lookup/MultipleInput
 * @includes Collection Controls/_lookup/SelectedCollection
 * @includes ItemTemplate wml!Controls/_lookup/SelectedCollection/ItemTemplate
 * @includes Opener Controls/_lookup/Opener
 * @includes LookupStyles Controls/_lookup/Lookup/LookupStyles
 * @includes SelectorButtonStyles Controls/_lookup/Button/SelectorButtonStyles
 * @includes LookupLinkStyles Controls/_lookup/Lookup/Link/LookupLinkStyles
 * @includes SelectedCollectionStyles Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * @includes ButtonItemTemplate wml!Controls/_lookup/Button/itemTemplate
 * @includes Link Controls/_lookup/Lookup/Link
 * @public
 * @author Крайнов Д.О.
 */

import Selector = require("Controls/_lookup/Button");
import Input = require("Controls/_lookup/Lookup");
import MultipleInput = require("Controls/_lookup/MultipleInput");
import Collection = require("Controls/_lookup/SelectedCollection");
import _CollectionController = require("Controls/_lookup/BaseController");
import ItemTemplate = require("wml!Controls/_lookup/SelectedCollection/ItemTemplate");
import ButtonItemTemplate = require("wml!Controls/_lookup/Button/itemTemplate");
import Opener = require("Controls/_lookup/Opener");
import PlaceholderChooser = require("Controls/_lookup/PlaceholderChooser");
import Link = require('Controls/_lookup/Lookup/Link');

export {
   Selector,
   Input,
   MultipleInput,
   Collection,
   _CollectionController,
   ItemTemplate,
   Opener,
   ButtonItemTemplate,
   PlaceholderChooser,
   Link
};
