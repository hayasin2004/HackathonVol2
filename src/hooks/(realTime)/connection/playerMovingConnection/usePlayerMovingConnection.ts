// import {useEffect} from "react";
// import {io, Socket} from 'socket.io-client';
//
// const usePlayerMovingConnection = (ECollisionPosition: { x: number, y: number }) => {
//
//     useEffect(() => {
//         // プレイヤー移動関数
//         const movePlayer = (x: number, y: number) => {
//
//             console.log("移動データを送信")
//             socket.emit('player_move', {playerId, roomId, x, y});
//         };
//
//     }, [ECollisionPosition]);
//     return {movePlayer}
//
// };
//
// export default usePlayerMovingConnection;