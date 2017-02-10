using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Larais.NuGetApp.Controllers
{
    [Route("api/feed")]
    public class FeedController : Controller
    {
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok();
        }

        [HttpPost]
        public IActionResult Add(string name)
        {
            return Ok();
        }

        [HttpPut]
        public IActionResult Rename(string currentName, string newName)
        {
            return Ok();
        }

        [HttpDelete]
        public IActionResult Delete(string name)
        {
            return Ok();
        }
    }
}
