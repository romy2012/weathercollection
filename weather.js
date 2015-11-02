function pngfix(c) {
    if (window.XMLHttpRequest) {
        return
    }
    var b = "display:inline-block; " + c.style.cssText;
    var a = '<span class="' + c.className + '" title="' + c.title + '" style="width:' + c.clientWidth + "px; height:" + c.clientHeight + "px;" + b + ";filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + c.src + "', sizingMethod='crop');\"></span>";
    c.outerHTML = a
}
var $ = function (a) {
    return document.getElementById(a)
};
var TPL = '<a hidefocus="hidefocus" class="chooseArrow" title="选择城市" href="javascript:void(0);" onclick="Weather.Set();return false;">#{city}</a><img src="http://www.muyingjie.com/Ext/J/weather/images/i/#{img1}.png" onload="pngfix(this)" width="20" height="20"/> #{today}';
var Ylmf = {
    Cookies: {
        set: function (b, d, a, e, c) {
            if (typeof a == "undefined") {
                a = new Date(new Date().getTime() + 1000 * 3600 * 24 * 365)
            }
            document.cookie = b + "=" + escape(d) + ((a) ? "; expires=" + a.toGMTString() : "") + ((e) ? "; path=" + e : "; path=/") + ((c) ? ";domain=" + c : "")
        }, get: function (b) {
            var a = document.cookie.match(new RegExp("(^| )" + b + "=([^;]*)(;|$)"));
            if (a != null) {
                return unescape(a[2])
            }
            return null
        }, clear: function (a, c, b) {
            if (this.get(a)) {
                document.cookie = a + "=" + ((c) ? "; path=" + c : "; path=/") + ((b) ? "; domain=" + b : "") + ";expires=Fri, 02-Jan-1970 00:00:00 GMT"
            }
        }
    },
    format: function (g, c) {
        if (arguments.length > 1) {
            var i = Ylmf.format,
                f = /([.*+?^=!:${}()|[\]\/\\])/g,
                b = (i.left_delimiter || "{").replace(f, "\\$1"),
                d = (i.right_delimiter || "}").replace(f, "\\$1"),
                j = i._r1 || (i._r1 = new RegExp("#" + b + "([^" + b + d + "]+)" + d, "g")),
                h = i._r2 || (i._r2 = new RegExp("#" + b + "(\\d+)" + d, "g"));
            if (typeof (c) == "object") {
                return g.replace(j, function (l, k) {
                    var m = c[k];
                    if (typeof m == "function") {
                        m = m(k)
                    }
                    return typeof (m) == "undefined" ? "" : m
                })
            } else {
                if (typeof (c) != "undefined") {
                    var a = Array.prototype.slice.call(arguments, 1),
                        e = a.length;
                    return g.replace(h, function (k, l) {
                        l = parseInt(l, 10);
                        return (l >= e) ? k : a[l]
                    })
                }
            }
        }
        return g
    }, getProId: function (b) {
        var c;
        for (var d = 0, a = CityArr.length; d < a; ++d) {
            if (CityArr[d][0] == b && parseInt(CityArr[d][2]) < 900) {
                c = CityArr[d][2]
            }
        }
        return c
    }, getCityId: function (b, d) {
        if (!b) {
            return false
        }
        var e;
        for (var c = 0, a = CityArr.length; c < a; ++c) {
            if (CityArr[c][1] == b && CityArr[c][0] == d) {
                e = CityArr[c][2]
            }
        }
        return e
    }, getCitys: function (c) {
        if (!c) {
            return false
        }
        var b = [];
        for (var d = 0, a = CityArr.length; d < a; ++d) {
            if (CityArr[d][1] == c) {
                b.push(CityArr[d])
            }
        }
        return b
    }, getSelectValue: function (b) {
        var a = b.selectedIndex,
            c, d;
        if (a > -1) {
            c = b.options[a];
            d = c.innerHTML.split(" ")[1];
            return d
        }
        return null
    }, ScriptLoader: {
        Add: function (c) {
            if (!c || !c.src) {
                return
            }
            var b = document.getElementsByTagName("head")[0],
                a = document.createElement("script");
            a.onload = a.onreadystatechange = function () {
                if (a && a.readyState && a.readyState != "loaded" && a.readyState != "complete") {
                    return
                }
                a.onload = a.onreadystatechange = a.onerror = null;
                a.Src = "";
                if (!document.all) {
                    a.parentNode.removeChild(a)
                }
                a = null
            };
            a.src = c.src;
            a.charset = c.charset || "gb2312";
            b.insertBefore(a, b.firstChild)
        }
    }
};
var W = document.getElementById("weather");
var Weather = {
    CityCookieName: "citydata",
    WeatherCookieName: "weather",
    DefaultCity: ["109", "101010100", "101010100", "\u5317\u4eac", "\u5317\u4eac"],
    StatIPQueue: [],
    StatGetQueue: [],
    ShowStatus: function (c) {
        if (!c) {
            return
        }
        var b = '<a hidefocus="hidefocus" class="chooseArrow" title="选择城市" href="javascript:void(0);" onclick="Weather.Set();return false;">#{city}</a><img src="http://www.muyingjie.com/Ext/J/weather/images/i/#{img1}.png" onload="pngfix(this)" width="20" height="20"/> #{today}';
        var d;
        switch (c) {
        case 100:
            d = '正在判断所在城市… <a href="javascript:void(0);" onclick="Weather.Set();return false;">[手动设置]</a>';
            break;
        case 101:
            d = "判断城市失败，请手动设置城市。";
            break;
        case 102:
            d = '正在获取天气数据，请稍等片刻…';
            break;
        case 404:
            d = '暂无该城市天气数据 <a href="javascript:void(0);" onclick="Weather.Set();return false;">[选择其它城市]</a>';
            break;
        case 500:
            d = '服务器故障或网络错误。<a href="javascript:void(0);" onclick="Weather.autoLoad(this);">[刷新重试]</a>';
            break;
        case 200:
            var a = arguments[1];
            d = Ylmf.format(b, {
                cityid: a[3],
                city: a[0],
                today: a[1],
                tomorrow: a[2],
                img1: a[4],
                img2: a[5]
            });
            break
        }
        W.innerHTML = d
    }, Ip2City: function (c) {
        this.ShowStatus(100);
        Ylmf.ScriptLoader.Add({
            src: "http://api.114la.com/ip/",
            charset: "gb2312"
        });
        var a = this;
        if (typeof b != "undefined") {
            window.clearTimeout(b)
        }
        var b = window.setTimeout(function () {
            Ylmf.Cookies.clear(this.CityCookieName);
            c && c(a.DefaultCity)
        }, 3000);
        window.ILData_callback = function () {
            if (typeof (ILData) != "undefined") {
                if (typeof b != "undefined") {
                    window.clearTimeout(b)
                }
                if (ILData[2] && ILData[3]) {
                    var d = Ylmf.getProId(ILData[2]);
                    var f = Ylmf.getCityId(d, ILData[3]);
                    var e = [d, f, f, ILData[2], ILData[3]];
                    Ylmf.Cookies.set(a.CityCookieName, e);
                    c && c(e)
                } else {
                    c && c(a.DefaultCity);
                    Ylmf.Cookies.set(a.CityCookieName, a.DefaultCity)
                }
            }
        }
    }, Get: function (e) {
        if (!e) {
            return
        }
        var b = e.slice(3, 7);
        var f = this.ShowStatus;
        var d = this;
        f(102);
        if (typeof a != "undefined") {
            window.clearTimeout(a)
        }
        var a = window.setTimeout(function () {
            f(500);
            Ylmf.Cookies.clear(this.CityCookieName)
        }, 5000);
        var c = "http://www.muyingjie.com/Ext/J/weather/api/" + b + "/" + e + ".txt";
        c += "?" + parseInt(Math.random() * 99);
        if (!Ylmf.Cookies.get(this.WeatherCookieName)) {}
        Ylmf.ScriptLoader.Add({
            src: c.toString(),
            charset: "utf-8"
        });
        window.Ylmf.getWeather = function (h) {
            window.clearTimeout(a);
            if (typeof (h) == "object" && typeof (h) != "undefined" && typeof (h.weatherinfo) != "undefined" && h.weatherinfo != false) {
                var i = [h.weatherinfo.temp1 + "&nbsp;" + h.weatherinfo.weather1, h.weatherinfo.temp2 + "&nbsp;" + h.weatherinfo.weather2];
                var g = [h.weatherinfo.city, i[0], i[1], e, h.weatherinfo.img1, h.weatherinfo.img3];
                if (g) {
                    Weather.ShowStatus(200, g);
                    Ylmf.Cookies.set(d.WeatherCookieName, 1)
                }
            } else {
                if (h.weatherinfo == false) {
                    Weather.ShowStatus(404)
                }
            }
        }
    }, Init: function () {
        var c = this.CityCookieName;
        var b = this;
        if (Ylmf.Cookies.get(this.CityCookieName)) {
            var a = Ylmf.Cookies.get(this.CityCookieName).split(",");
            if (!a[2]) {
                Ylmf.Cookies.clear(this.CityCookieName);
                b.Init()
            }
            this.Get(a[2])
        } else {
            this.Ip2City(function (d) {
                var e = Ylmf.Cookies.get(b.CityCookieName);
                if (e) {
                    e = e.split(",");
                    b.Get(e[2])
                } else {
                    b.Get(d[2])
                }
            })
        }
    }, getAreas: function (c, b) {
        var a = c.slice(3, 7);
        Ylmf.ScriptLoader.Add({
            src: "http://www.muyingjie.com/Ext/J/weather/api/" + a + "/" + a + ".txt",
            charset: "utf-8"
        });
        Ylmf.getAreaCity = function (d) {
            if (typeof (d) == "object" && typeof (d.result) != "undefined" && typeof (d.result[0][0]) != "undefined") {
                b(d.result)
            }
        }
    }, initCitys: function (b) {
        if (!b) {
            return
        }
        $("w_city").innerHTML = "";
        for (var d = 0, a = CityArr.length; d < a; ++d) {
            var c = CityArr[d];
            if (c[1] == b) {
                var e = document.createElement("option");
                e.value = c[2];
                e.innerHTML = c[3] + "&nbsp;" + c[0];
                $("w_city").appendChild(e)
            }
        }
        $("w_city").selectedIndex = 0
    }, initAreaCitys: function (b, a) {
        $("l_city").innerHTML = "";
        this.getAreas(b, function (g) {
            for (var e = 0, c = g.length; e < c; ++e) {
                var d = g[e];
                var f = document.createElement("option");
                if (d[0] == b) {
                    f.selected = true
                }
                f.value = d[0];
                f.innerHTML = d[2] + "&nbsp;" + d[1];
                $("l_city").appendChild(f)
            }
            if (a) {
                a()
            }
        })
    }, Set: function () {
        W.style.display = "none";
        $("setCityBox").style.display = "";
        var a = Ylmf.Cookies.get(this.CityCookieName);
        if (a) {
            a = a.split(",")
        } else {
            a = this.DefaultCity
        }
        $("w_pro").value = a[0];
        this.initCitys(a[0]);
        $("w_city").value = a[1];
        this.initAreaCitys(a[2])
    }, cp: function (a) {
        this.initCitys(a);
        $("w_city").selectedIndex = 0;
        this.cc($("w_city").value)
    }, cc: function (a) {
        this.initAreaCitys(a, function () {})
    }, boxClose: function(a) {
		$("setCityBox").style.display = "none";
		W.style.display = ""
	},custom: function () {
        var a = Ylmf.Cookies.get(this.CityCookieName);
        if (a) {
            a = a.split(",")
        } else {
            a = this.DefaultCity
        }
        var b = [$("w_pro").value, $("w_city").value, $("l_city").value ? $("l_city").value : $("w_city").value, Ylmf.getSelectValue($("w_pro")), Ylmf.getSelectValue($("w_city"))];
        if (a[2] != b[2]) {
            this.Get(b[2]);
            Ylmf.Cookies.set(this.CityCookieName, b)
        }
        $("setCityBox").style.display = "none";
        W.style.display = ""
    }, autoLoad: function () {
        Ylmf.Cookies.clear(this.CityCookieName);
        Ylmf.Cookies.clear(this.WeatherCookieName);
        window.location.reload()
    }
};
Weather.Init();