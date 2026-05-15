import type {
  WarehouseNamespaceOptions,
  WarehouseSetOptions,
  WarehouseService,
} from '../src';

const namespaceOptions: WarehouseNamespaceOptions = { ns: 'chapter1' };
const setOptions: WarehouseSetOptions = { freeze: true, ns: 'chapter1' };

type GetSignature = WarehouseService['get'];
type TryGetSignature = WarehouseService['tryGet'];
type HasSignature = WarehouseService['has'];
type RefreshSignature = WarehouseService['refresh'];
type KeysSignature = WarehouseService['keys'];
type ClearSignature = WarehouseService['clear'];

const getWithNamespace: GetSignature = (_key, _options = namespaceOptions) =>
  undefined as never;
const tryGetWithNamespace: TryGetSignature = (
  _key,
  _options = namespaceOptions,
) => undefined;
const hasWithNamespace: HasSignature = (_key, _options = namespaceOptions) =>
  true;
const refreshWithNamespace: RefreshSignature = async (
  _key,
  _options = namespaceOptions,
) => undefined as never;
const keysWithNamespace: KeysSignature = (_options = namespaceOptions) => [];
const clearWithNamespace: ClearSignature = (_options = namespaceOptions) =>
  undefined;

void setOptions;
void getWithNamespace;
void tryGetWithNamespace;
void hasWithNamespace;
void refreshWithNamespace;
void keysWithNamespace;
void clearWithNamespace;
