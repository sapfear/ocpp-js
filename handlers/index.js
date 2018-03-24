const Authorize = require('./authorize');
const BootNotification = require('./bootNotification');
const StartTransaction = require('./startTransaction');
const StopTransaction = require('./stopTransaction');
const Heartbeat = require('./heartbeat');
const MeterValues = require('./meterValues');
const StatusNotification = require('./statusNotification');
const FirmwareStatusNotification = require('./firmwareStatusNotification');
const DiagnosticsStatusNotification = require('./diagnosticsStatusNotification');
const DataTransfer = require('./dataTransfer');


const Reset = require('./reset');
const SendLocalList = require('./sendLocalList');
const GetLocalListVersion = require('./getLocalListVersion');
const GetConfiguration = require('./getConfiguration');
const ClearCache = require('./clearCache');
const RemoteStopTransaction = require('./remoteStopTransaction');
const RemoteStartTransaction = require('./remoteStartTransaction');
const ReserveNow = require('./reserveNow');
const CancelReservation = require('./cancelReservation');
const ChangeAvailability = require('./changeAvailability');
const ChangeConfiguration = require('./changeConfiguration');
const UnlockConnector = require('./unlockConnector');

module.exports = {
    Authorize: Authorize,
    BootNotification: BootNotification,
    StartTransaction: StartTransaction,
    StopTransaction: StopTransaction,
    Heartbeat: Heartbeat,
    MeterValues: MeterValues,
    StatusNotification: StatusNotification,
    FirmwareStatusNotification: FirmwareStatusNotification,
    DiagnosticsStatusNotification: DiagnosticsStatusNotification,
    DataTransfer: DataTransfer,
	GetDiagnostics: require('./getDiagnostics'),
	UpdateFirmware: require('./updateFirmware'),
	
    Reset: Reset,
	SendLocalList: SendLocalList,
	GetLocalListVersion: GetLocalListVersion,
	GetConfiguration: GetConfiguration,
	ClearCache: ClearCache,
	RemoteStopTransaction: RemoteStopTransaction,
	RemoteStartTransaction: RemoteStartTransaction,
	ReserveNow: ReserveNow,
	CancelReservation: CancelReservation,
	ChangeAvailability: ChangeAvailability,
	UnlockConnector: UnlockConnector,
	ChangeConfiguration: ChangeConfiguration
}
