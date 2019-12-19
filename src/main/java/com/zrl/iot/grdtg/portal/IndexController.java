package com.zrl.iot.grdtg.portal;

import io.swagger.annotations.Api;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


/**
 * @Author: zhouruilian
 * @Description: TODO
 * @Date: Created in 16:57 2019-05-29
 * @Modified By:
 */
@Controller
@RequestMapping("")
@Api(value = "", tags = "Index信息", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class IndexController {
    @GetMapping("index")
    public String home(ModelMap model) {
        model.addAttribute("title", "概览");
        return "ace/index";
    }
}
