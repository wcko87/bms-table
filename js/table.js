// メニュー開閉
function menu(tName){
    var tMenu = document.getElementById(tName).style;
    if (tMenu.display == 'none'){
        tMenu.display = "block";
    }else{
        tMenu.display = "none";
    }
}

function pluralCharts(count) {
    return count + (count == 1 ? " Chart" : " Charts");
}

var NEW_TAB = ' target="_blank" rel="noopener noreferrer"'

$(document).ready(function(){
    /*$.get($("meta[name=bmstable]").attr("content"), function(data) {
        console.log(data);
    }, 'text').fail(function(jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });*/
    $.getJSON($("meta[name=bmstable]").attr("content"), function(header){
        //$("#update").text("Last Update : " + header.last_update);
        $.getJSON(header.data_url, function(information){
            // headerのsort有無で分岐
            if(header["level_order"]){
                makeBMSTable(information,header.symbol,header["level_order"]);
            } else {
            makeBMSTable(information,header.symbol);
            }
        });
    }).fail(function(jqXHR, textStatus, errorThrown) { console.log("fail " + errorThrown); });
});


// ソートのための引数追加
function makeBMSTable(info, mark, order) {
    // orderが未指定の場合はnull
    if(typeof order === 'undefined'){
        order = null;
    }
    
    var x = "";
    var ev = "";
    var count = 0;
    var obj = $("#table_int");

    // ソート
    if(order != "" && order != null){
        // herder.jsonにsortが存在する場合は指定順->タイトル順にソート
        
        var orderAry = [];
        for(var l = 0; l < order.length; l++){
            orderAry.push(order[l].toString());
        }
        
        for(var j = 0; j < info.length; j++){
            var index=orderAry.indexOf(info[j]["level"]);
            info[j]["_index"]=index;
        }

        info.sort(function(a,b){
            if(a["_index"] < b["_index"]){
                return -1;
            } else if(a["_index"] > b["_index"]){
                return 1;
            } else if( a["title"].toLowerCase() < b["title"].toLowerCase() ){
                return -1;
            } else if( a["title"].toLowerCase() > b["title"].toLowerCase() ){
                return 1;
            } else {
    　   　　  return 0;
            }
        });
        for(var k=0; k < info.length; k++){
            delete info[k]["_index"];
        }
    } else {
        // そうでない場合はレベル順->タイトル順にソート
        info.sort(
            function(a,b){
                var aLv = a["level"].toString();
                var bLv = b["level"].toString();
                if(isNaN(a["level"]) == false && isNaN(b["level"]) == false){
                    return a["level"]-b["level"];
                } else if( aLv < bLv ){
                    return -1;
                } else if( aLv > bLv ){
                    return 1;
                } else if( a["title"].toLowerCase() < b["title"].toLowerCase() ){
                    return -1;
                } else if( a["title"].toLowerCase() > b["title"].toLowerCase() ){
                    return 1;
                } else {
        　   　　  return 0;
                }
            }
        );
    }
    
    // 表のクリア
    obj.html("");
    var obj_sep = null;
    for (var i = 0; i < info.length; i++) {
        // 難度ごとの区切り
        if (x != info[i].level) {
            // 前の区切りに譜面数、平均密度を追加
            if (obj_sep != null) {
                obj_sep.html("<td colspan='10' align='center'>" + "<b>" + mark + x + " (" + pluralCharts(count) + ")</b></td>");
            }
            obj_sep = $("<tr class='tr_separate' id='" + mark + info[i].level + "'></tr>");
            obj_sep.appendTo(obj);
            count = 0;
            x = info[i].level;
        }
        // Base table row
        var str = $("<tr class='tr_normal'></tr>");

        if (info[i].favorite == 1) {
            str = $("<tr class='tr_normal_fav'></tr>");
        }

        // Level Display
        $("<td>" + mark + x + "</td>").appendTo(str);

        // Video Preview
        if(info[i].video1 != "" && info[i].video1 != null){
            // ニコニコ
            $("<td align='center'><a href='http://www.nicovideo.jp/watch/sm" + info[i].video1 + "'"+NEW_TAB+">VIDEO</a></td>").appendTo(str);
        } else if(info[i].video2 != "" && info[i].video2 != null){
            // YouTube
            $("<td align='center'><a href='https://www.youtube.com/watch?v=" + info[i].video2 + "'"+NEW_TAB+">VIDEO</a></td>").appendTo(str);
        } else if(info[i].video3 != "" && info[i].video3 != null){
            // vimeo
            $("<td align='center'><a href='http://vimeo.com/" + info[i].video3 + "'"+NEW_TAB+">VIDEO</a></td>").appendTo(str);
        } else {
            $("<td>-</td>").appendTo(str);
        }

　　　　// Chart Preview (ribbit)
　　　　$("<td align='center'><a href='http://www.ribbit.xyz/bms/score/view?p=1&md5=" + info[i].md5 + "'"+NEW_TAB+">VIEW</a></td>").appendTo(str);

        // Title
        $("<td>" + info[i].title + "</td>").appendTo(str);

        // Artist
        if(info[i].artist != "" && info[i].artist != null) {
            $("<td>" + info[i].artist + "</td>").appendTo(str);
        } else {
            $("<td>?</td>").appendTo(str);
        }

        // Event
        if(info[i].event != "" && info[i].event != null) {
            if(info[i].event_url != "" && info[i].event_url != null) {
                $("<td><a href='" + info[i].event_url + "'"+NEW_TAB+">" + info[i].event + "</a></td>").appendTo(str);
            } else {
                $("<td>" + info[i].event + "</td>").appendTo(str);
            }
        } else {
            $("<td>?</td>").appendTo(str);
        }

        // Song DL
        var astr = "";
        if(info[i].url != "" && info[i].url != null) {
            astr = "<a href='" + info[i].url + "'"+NEW_TAB+">本体</a>";
        } else {
            astr = "?";
        }
        if(info[i].url_pack != "" && info[i].url_pack != null) {
            if(info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br />(<a href='" + info[i].url_pack + "'"+NEW_TAB+">" + info[i].name_pack + "</a>)";
            } else {
                astr += "<br />(<a href='" + info[i].url_pack + "'"+NEW_TAB+">" + info[i].url_pack + "</a>)";
            }
        } else {
            if(info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br />(" + info[i].name_pack + ")";
            }
        }
        $("<td>" + astr + "</td>").appendTo(str);

        // Sabun DL
        if(info[i].url_diff != "" && info[i].url_diff != null) {
            $("<td><a href='" + info[i].url_diff + "'"+NEW_TAB+">差分</a></td>").appendTo(str);
        } else {
            // 同梱 (Default Chart)
            $("<td>N/A</td>").appendTo(str);
        }

        // LR2IR
        $("<td>" + "<a href='http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=" + info[i].md5 + "'"+NEW_TAB+">LR2IR</a></td>").appendTo(str);

        // Comment
        $("<td>" + info[i].comment + "</div></td>").appendTo(str);
        str.appendTo(obj);
        count++;
    }

    
    // 最後の区切り処理
    // マークが抜け落ちてたので追加
    if (obj_sep != null) {
        obj_sep.html("<td colspan='10' align='center'>" + "<b>" + mark + x + " (" + pluralCharts(count) + ")</b></td>");
    }
}