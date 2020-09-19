const canvas = require('canvas');

async function draw(context, replyFunc, bot) {
    if (!/^我有一?个朋友\[CQ:at,qq=(\d+)\]\s{1,3}?说过?/.test(context.message)) return false;
    let user_id = /\[CQ:at,qq=(\d+)\]/.exec(context.message);
    if (!user_id) return false;
    else user_id = user_id[1];
    const member_info = await bot("get_group_member_info", {
        user_id : user_id,
        group_id : context.group_id,
    });
    if (!member_info || member_info.status != "ok") return false;
    let name = member_info.data.card ? member_info.data.card : member_info.data.nickname;
    if (!name) return false;
    if (name.length > 16) name = name.substring(0, 16) + "...";
    let message = /(?:(?<!CQ)[:：](.+)|['"‘“](.+?)['"’”])$/.exec(context.message)
        .filter((noEmpty) => {return noEmpty != undefined});
    if (!message) return false;
    else message = message[1].substring(0, 18);
    message.replace(/\[CQ.+?\]/g, "");

    const width = 764;
    const height = 300;
    const base = canvas.createCanvas(width, height);
    let ctx = base.getContext("2d");
    ctx.fillStyle = "#ECECF6";
    ctx.fillRect(0, 0, width, height);
    
    // 填充名字
    ctx.fillStyle = "#959595";
    ctx.font = "800 20px Source Han Sans";
    ctx.fillText(name, 136, 60);

    // 填充文字
    ctx.fillStyle = "#000000";
    ctx.font = "300 32px Sans";
    ctx.fillText(message, 150, 127);
    
    // 填充头像
    let head = await canvas.loadImage(`http://q1.qlogo.cn/g?b=qq&s=100&nk=${user_id}`);
    let round_head = canvas.createCanvas(head.width, head.height);
    let head_ctx = round_head.getContext("2d");
    
    // 弄圆
    head_ctx.beginPath();
    head_ctx.arc(89/2, 89/2, 89/2, 0, Math.PI*2, false);
    head_ctx.fill()
    head_ctx.closePath();
    head_ctx.clip();
    
    head_ctx.drawImage(head, 0, 0, 89, 89);
    ctx.drawImage(head_ctx.canvas, 29, 29, 89, 89);

    const img64 = base.toBuffer("image/jpeg", {quality : 1}).toString("base64");
    replyFunc(context, `[CQ:image,file=base64://${img64}]`);
    return true;
}

module.exports = {draw};