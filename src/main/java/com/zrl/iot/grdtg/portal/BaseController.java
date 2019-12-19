package com.zrl.iot.grdtg.portal;

import io.swagger.annotations.Api;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @Author: zhouruilian
 * @Description: TODO
 * @Date: Created in 20:31 2019-05-18
 * @Modified By:
 */
@Controller
@RequestMapping("")
@Api(value = "", tags = "基本接口信息", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class BaseController {

    @GetMapping("/login")
    public String login() {
        return "ace/login";
    }

    @GetMapping("/unauthorized.html")
    public String unauthorized() {
        return "ace/exception/unauthorized";
    }

    @GetMapping("/error")
    public String error404() {
        return "ace/exception/error-404";
    }
}
